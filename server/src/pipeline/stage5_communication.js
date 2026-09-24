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

  const formattedIssues = issues.length > 1
    ? issues.map((i, idx) => `${idx + 1}. ${i}`).join('\n')
    : issues[0];

  const systemPrompt = `You write short, professional vendor-facing emails explaining exactly what information or correction is needed to complete onboarding. Be specific, not generic. Two to four sentences. No filler. Do not use raw bullet dashes or hyphens.`;

  const userPrompt = `Status: ${status}
Issues found: ${formattedIssues}
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
    const fallback = `Dear ${companyName},\n\nWe are currently reviewing your vendor onboarding submission. To proceed with account activation, please address the following:\n\n${formattedIssues}\n\nPlease reply with the requested information.\n\nRegards,\nVendor Compliance Operations`;
    return {
      draftedMessage: fallback,
      steps: [
        step(
          'communication',
          'draft_vendor_message',
          'pass',
          'Drafted standard vendor follow-up communication.'
        ),
      ],
    };
  }
}
