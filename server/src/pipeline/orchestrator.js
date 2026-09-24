import { runIntake } from './stage1_intake.js';
import { runStructuralValidation } from './stage2_structural.js';
import { runSemanticValidation } from './stage3_semantic.js';
import { runDecision } from './stage4_decision.js';
import { runCommunication } from './stage5_communication.js';

export async function runPipeline(rawInput, existingVendors) {
  const started = Date.now();
  const allSteps = [];

  const { normalized, steps: intakeSteps } = runIntake(rawInput);
  allSteps.push(...intakeSteps);

  const structuralSteps = runStructuralValidation(normalized, existingVendors);
  allSteps.push(...structuralSteps);

  const semanticSteps = await runSemanticValidation(normalized);
  allSteps.push(...semanticSteps);

  const { status, finalReasoning, steps: decisionSteps, issueDetails } =
    runDecision(allSteps);
  allSteps.push(...decisionSteps);

  const { draftedMessage, steps: commSteps } = await runCommunication(
    status,
    normalized.company_name,
    issueDetails
  );
  allSteps.push(...commSteps);

  const durationMs = Date.now() - started;

  return {
    normalized,
    status,
    finalReasoning,
    draftedMessage,
    steps: allSteps,
    durationMs,
  };
}
