import { isStructuralHardFail } from './stage2_structural.js';

function step(stage, step_name, result, detail) {
  return { stage, step_name, result, detail };
}

export function runDecision(allSteps) {
  const structural = allSteps.filter((s) => s.stage === 'structural');
  const nonDecision = allSteps.filter((s) => s.stage !== 'decision');

  if (isStructuralHardFail(structural)) {
    const reasons = structural
      .filter((s) => s.result === 'fail')
      .map((s) => s.detail)
      .join(' ');
    const status = 'rejected';
    const finalReasoning =
      reasons ||
      'Application rejected due to structural validation failures (format or duplicate vendor).';
    const decisionStep = step(
      'decision',
      'aggregate_decision',
      'fail',
      `Decision: REJECTED — ${finalReasoning}`
    );
    return { status, finalReasoning, steps: [decisionStep] };
  }

  const hasFailOrWarn = nonDecision.some(
    (s) => s.result === 'fail' || s.result === 'warn'
  );

  if (hasFailOrWarn) {
    const issues = nonDecision
      .filter((s) => s.result === 'fail' || s.result === 'warn')
      .map((s) => s.detail);
    const status = 'pending';
    const finalReasoning =
      issues.length > 0
        ? `Pending review: ${issues.join(' ')}`
        : 'Pending review: one or more checks require attention.';
    const decisionStep = step(
      'decision',
      'aggregate_decision',
      'warn',
      `Decision: PENDING — additional information or corrections needed.`
    );
    return { status, finalReasoning, steps: [decisionStep], issueDetails: issues };
  }

  const status = 'approved';
  const finalReasoning =
    'All structural and semantic checks passed. Vendor meets onboarding criteria.';
  const decisionStep = step(
    'decision',
    'aggregate_decision',
    'pass',
    'Decision: APPROVED — ready for vendor activation.'
  );
  return { status, finalReasoning, steps: [decisionStep] };
}
