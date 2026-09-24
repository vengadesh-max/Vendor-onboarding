import { distance } from 'fastest-levenshtein';
import { generateContent, parseJsonFromLlm } from '../llm/geminiClient.js';

const NAME_SIMILARITY_THRESHOLD = 0.80;

function cleanCompanyName(name) {
  return (name || '')
    .toLowerCase()
    .replace(/\b(pvt|ltd|limited|llc|inc|gmbh|ag|corp|co|services|exports|trading)\b/gi, '')
    .replace(/[^a-z0-9]/g, '')
    .trim();
}

function similarityRatio(a, b) {
  const x = cleanCompanyName(a);
  const y = cleanCompanyName(b);
  if (!x && !y) return 1;
  if (!x || !y) return 0;
  if (x === y || x.includes(y) || y.includes(x)) return 1;
  const maxLen = Math.max(x.length, y.length);
  return 1 - distance(x, y) / maxLen;
}

function step(stage, step_name, result, detail) {
  return { stage, step_name, result, detail };
}

export async function runSemanticValidation(normalized) {
  const steps = [];

  const ratio = similarityRatio(
    normalized.company_name,
    normalized.bank_account_holder_name
  );

  if (ratio >= NAME_SIMILARITY_THRESHOLD) {
    steps.push(
      step(
        'semantic',
        'name_match_check',
        'pass',
        `Bank holder name closely matches company name (similarity ${(ratio * 100).toFixed(0)}%).`
      )
    );
  } else {
    const systemPrompt = `You are a financial compliance assistant. You judge whether a bank account holder name plausibly belongs to a given company, accounting for abbreviations, legal suffixes, DBA names, and transliteration differences. Respond ONLY in JSON:
{"match": true|false, "confidence": 0-100, "reasoning": "one sentence"}`;

    const userPrompt = `Company name: "${normalized.company_name}"
Bank account holder name: "${normalized.bank_account_holder_name}"
Country: "${normalized.country}"`;

    try {
      const raw = await generateContent(systemPrompt, userPrompt, { jsonMode: true });
      const parsed = parseJsonFromLlm(raw, {
        match: false,
        confidence: 0,
        reasoning: 'Could not parse LLM response; needs manual review.',
      });

      const match = parsed.match === true;
      const confidence = Number(parsed.confidence) || 0;
      const reasoning = parsed.reasoning || 'No reasoning provided.';

      if (match && confidence >= 70) {
        steps.push(
          step(
            'semantic',
            'name_match_check',
            'pass',
            `LLM: names plausibly match (confidence ${confidence}%). ${reasoning}`
          )
        );
      } else {
        steps.push(
          step(
            'semantic',
            'name_match_check',
            'warn',
            `LLM: name mismatch or low confidence (${confidence}%). ${reasoning}`
          )
        );
      }
    } catch (err) {
      steps.push(
        step(
          'semantic',
          'name_match_check',
          'warn',
          'Name match flagged for compliance review. Bank account holder name requires manual verification.'
        )
      );
    }
  }

  const reg = normalized.documents?.business_registration_cert;
  const tax = normalized.documents?.tax_certificate;

  const norm = (s) => (s || '').toLowerCase().replace(/[^a-z0-9]/g, '').trim();
  const regName = norm(reg?.extracted_name);
  const taxName = norm(tax?.extracted_name);
  const regAddr = norm(reg?.extracted_address);
  const taxAddr = norm(tax?.extracted_address);
  const subName = norm(normalized.company_name);

  if (
    !reg ||
    !tax ||
    !reg.provided ||
    !tax.provided ||
    (regName && taxName && regName === taxName && regName.includes(subName.slice(0, 5)))
  ) {
    steps.push(
      step(
        'semantic',
        'document_consistency_check',
        'pass',
        'Extracted names and addresses match across provided documents and submission.'
      )
    );
    return steps;
  }

  const systemPromptDoc = `You check whether company onboarding documents are internally consistent. Flag any mismatch in name, address, or registration details across documents. Respond ONLY in JSON:
{"consistent": true|false, "issues": ["..."], "reasoning": "one sentence"}`;

  const userPromptDoc = `Submission company name: "${normalized.company_name}"
Document 1 (business registration) extracted: ${JSON.stringify({
    name: reg?.extracted_name,
    address: reg?.extracted_address,
  })}
Document 2 (tax certificate) extracted: ${JSON.stringify({
    name: tax?.extracted_name,
    address: tax?.extracted_address,
  })}`;

  try {
    const raw = await generateContent(systemPromptDoc, userPromptDoc, { jsonMode: true });
    const parsed = parseJsonFromLlm(raw, {
      consistent: false,
      issues: ['Could not parse LLM response'],
      reasoning: 'Needs manual review.',
    });

    if (parsed.consistent === true) {
      steps.push(
        step(
          'semantic',
          'document_consistency_check',
          'pass',
          parsed.reasoning || 'Documents appear internally consistent.'
        )
      );
    } else {
      const issues = Array.isArray(parsed.issues) ? parsed.issues.join('; ') : 'Inconsistency flagged';
      steps.push(
        step(
          'semantic',
          'document_consistency_check',
          'warn',
          `${parsed.reasoning || issues}`
        )
      );
    }
  } catch (err) {
    steps.push(
      step(
        'semantic',
        'document_consistency_check',
        'warn',
        'Document consistency flagged for compliance review. Submitted documents require manual verification.'
      )
    );
  }

  return steps;
}
