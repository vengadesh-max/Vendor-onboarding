import validator from 'validator';

export const TAX_ID_PATTERNS = {
  US: /^\d{2}-\d{7}$/,
  IN: /^\d{2}[A-Z]{5}\d{4}[A-Z]{1}\d[Z]{1}[A-Z\d]{1}$/,
  GB: /^GB\d{9}$/,
  DE: /^DE\d{9}$/,
};

const REQUIRED_TOP_LEVEL = [
  'company_name',
  'country',
  'tax_id',
  'bank_account_holder_name',
  'bank_account_number',
  'bank_name',
  'swift_or_ifsc',
  'contact_email',
  'contact_phone',
];

const REQUIRED_DOCS = [
  'business_registration_cert',
  'tax_certificate',
  'bank_confirmation_letter',
];

function step(stage, step_name, result, detail) {
  return { stage, step_name, result, detail };
}

export function runStructuralValidation(normalized, existingVendors) {
  const steps = [];

  const missingFields = REQUIRED_TOP_LEVEL.filter((f) => !normalized[f]);
  const missingDocs = REQUIRED_DOCS.filter(
    (d) => !normalized.documents?.[d]?.provided
  );

  if (missingFields.length > 0 || missingDocs.length > 0) {
    const parts = [];
    if (missingFields.length) parts.push(`fields: ${missingFields.join(', ')}`);
    if (missingDocs.length) parts.push(`documents: ${missingDocs.join(', ')}`);
    steps.push(
      step(
        'structural',
        'required_fields_check',
        'fail',
        `Missing required ${parts.join('; ')}.`
      )
    );
  } else {
    steps.push(
      step(
        'structural',
        'required_fields_check',
        'pass',
        'All required fields and documents marked as provided.'
      )
    );
  }

  const pattern = TAX_ID_PATTERNS[normalized.country];
  if (!pattern) {
    steps.push(
      step(
        'structural',
        'tax_id_format_check',
        'warn',
        `No tax ID pattern configured for country ${normalized.country}; format not verified.`
      )
    );
  } else if (!pattern.test(normalized.tax_id)) {
    steps.push(
      step(
        'structural',
        'tax_id_format_check',
        'fail',
        `Tax ID "${normalized.tax_id}" does not match expected format for ${normalized.country}.`
      )
    );
  } else {
    steps.push(
      step(
        'structural',
        'tax_id_format_check',
        'pass',
        `Tax ID format valid for ${normalized.country}.`
      )
    );
  }

  const acct = normalized.bank_account_number;
  const bankOk =
    acct.length >= 6 &&
    acct.length <= 34 &&
    /^[A-Za-z0-9]+$/.test(acct);
  if (!bankOk) {
    steps.push(
      step(
        'structural',
        'bank_details_check',
        'fail',
        'Bank account number missing or fails length/pattern sanity check (6–34 alphanumeric).'
      )
    );
  } else if (!validator.isEmail(normalized.contact_email)) {
    steps.push(
      step(
        'structural',
        'bank_details_check',
        'fail',
        'Contact email is not a valid email address.'
      )
    );
  } else {
    steps.push(
      step(
        'structural',
        'bank_details_check',
        'pass',
        'Bank account and contact email appear well-formed.'
      )
    );
  }

  const dup = existingVendors.find(
    (v) =>
      v.tax_id === normalized.tax_id ||
      v.bank_account_number === normalized.bank_account_number
  );
  if (dup) {
    steps.push(
      step(
        'structural',
        'duplicate_vendor_check',
        'fail',
        `Matches existing vendor record "${dup.company_name}" (tax ID or bank account) — possible duplicate or fraud attempt.`
      )
    );
  } else {
    steps.push(
      step(
        'structural',
        'duplicate_vendor_check',
        'pass',
        'No duplicate tax ID or bank account in vendor registry.'
      )
    );
  }

  return steps;
}

/** Hard structural fails → rejected in decision engine */
export function isStructuralHardFail(steps) {
  const hard = ['tax_id_format_check', 'duplicate_vendor_check'];
  return steps.some(
    (s) => s.stage === 'structural' && hard.includes(s.step_name) && s.result === 'fail'
  );
}
