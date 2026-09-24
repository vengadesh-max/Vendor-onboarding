import { generateContent } from '../llm/geminiClient.js';

function step(stage, step_name, result, detail) {
  return { stage, step_name, result, detail };
}

export async function runCommunication(status, companyName, issueDetails) {
  if (status === 'approved') {
    return {
      draftedMessage: null,
      steps: [
        step(
          'communication',
          'draft_vendor_message',
          'pass',
          'No follow-up message needed — application approved.'
        ),
      ],
    };
  }

  const issues = issueDetails?.length
    ? issueDetails
    : ['Please review the flagged items in your submission.'];

  const systemPrompt = `You write short, professional vendor-facing emails explaining exactly what information or correction is needed to complete onboarding. Be specific, not generic. Two to four sentences. No filler.`;

  const userPrompt = `Status: ${status}
Issues found: ${issues.map((i) => `- ${i}`).join('\n')}
Company name: ${companyName}`;

  try {
    const draftedMessage = await generateContent(systemPrompt, userPrompt, {
      temperature: 0.3,
      jsonMode: false,
    });
    return {
      draftedMessage: draftedMessage.trim(),
      steps: [
        step(
          'communication',
          'draft_vendor_message',
          'pass',
          'Drafted vendor follow-up message.'
        ),
      ],
    };
  } catch (err) {
    const fallback = `Dear ${companyName},\n\nWe need additional information to complete your vendor onboarding. ${issues[0]}\n\nPlease reply with the requested details.\n\nRegards,\nVendor Operations`;
    return {
      draftedMessage: fallback,
      steps: [
        step(
          'communication',
          'draft_vendor_message',
          'warn',
          `Used template message (LLM unavailable: ${err.message}).`
        ),
      ],
    };
  }
}
