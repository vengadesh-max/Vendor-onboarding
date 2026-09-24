import { runStructuralValidation, TAX_ID_PATTERNS } from './stage2_structural.js';
import { runDecision } from './stage4_decision.js';
import { runIntake } from './stage1_intake.js';

const vendors = [
  { company_name: 'Globex', tax_id: '12-3456789', bank_account_number: '9876543210' },
];

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

const duplicateInput = {
  company_name: 'Fake',
  country: 'US',
  tax_id: '12-3456789',
  bank_account_holder_name: 'Fake',
  bank_account_number: '111111111111',
  bank_name: 'X',
  swift_or_ifsc: 'X',
  contact_email: 'a@b.com',
  contact_phone: '1',
  documents: {
    business_registration_cert: { provided: true },
    tax_certificate: { provided: true },
    bank_confirmation_letter: { provided: true },
  },
};

const { normalized } = runIntake(duplicateInput);
const steps = runStructuralValidation(normalized, vendors);
const dup = steps.find((s) => s.step_name === 'duplicate_vendor_check');
assert(dup.result === 'fail', 'duplicate should fail');

const badTax = runIntake({
  ...duplicateInput,
  tax_id: '27AAAPL1234C1Z5',
  bank_account_number: '222222222222',
}).normalized;
const taxSteps = runStructuralValidation(badTax, vendors);
const tax = taxSteps.find((s) => s.step_name === 'tax_id_format_check');
assert(tax.result === 'fail', 'US+GSTIN should fail tax format');

const missing = runIntake({
  ...duplicateInput,
  tax_id: '98-7654321',
  documents: {
    ...duplicateInput.documents,
    bank_confirmation_letter: { provided: false },
  },
}).normalized;
const missSteps = runStructuralValidation(missing, vendors);
const req = missSteps.find((s) => s.step_name === 'required_fields_check');
assert(req.result === 'fail', 'missing doc should fail required check');

const decision = runDecision(missSteps);
assert(decision.status === 'pending', 'missing doc → pending');

const rejectDecision = runDecision(taxSteps);
assert(rejectDecision.status === 'rejected', 'bad tax → rejected');

console.log('Structural tests OK. Tax patterns:', Object.keys(TAX_ID_PATTERNS));
