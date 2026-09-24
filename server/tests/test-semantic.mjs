import { runIntake } from '../src/pipeline/stage1_intake.js';
import { runSemanticValidation } from '../src/pipeline/stage3_semantic.js';
import { SAMPLE_PRESETS } from '../src/samples/presets.js';

const happy = SAMPLE_PRESETS.find((p) => p.id === 'happy').data;
const { normalized } = runIntake(happy);
const steps = await runSemanticValidation(normalized);
console.log(steps);
