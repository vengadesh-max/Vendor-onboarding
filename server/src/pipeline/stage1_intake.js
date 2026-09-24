/**
 * Stage 1 — Intake & normalize
 */
export function normalizeSubmission(raw) {
  const documents = {};
  const rawDocs = raw.documents || {};
  for (const [key, doc] of Object.entries(rawDocs)) {
    documents[key] = {
      ...doc,
      extracted_name: doc.extracted_name?.trim(),
      extracted_address: doc.extracted_address?.trim(),
    };
  }

  return {
    company_name: raw.company_name?.trim() ?? '',
    country: (raw.country?.trim() ?? '').toUpperCase(),
    tax_id: (raw.tax_id?.trim() ?? '').toUpperCase().replace(/\s/g, ''),
    bank_account_holder_name: raw.bank_account_holder_name?.trim() ?? '',
    bank_account_number: (raw.bank_account_number?.trim() ?? '').replace(/\s/g, ''),
    bank_name: raw.bank_name?.trim() ?? '',
    swift_or_ifsc: (raw.swift_or_ifsc?.trim() ?? '').toUpperCase(),
    contact_email: (raw.contact_email?.trim() ?? '').toLowerCase(),
    contact_phone: raw.contact_phone?.trim() ?? '',
    documents,
  };
}

export function runIntake(raw) {
  const normalized = normalizeSubmission(raw);
  const steps = [
    {
      stage: 'intake',
      step_name: 'received_submission',
      result: 'pass',
      detail: `Received submission for "${normalized.company_name || 'Unknown'}" (${normalized.country || 'N/A'}).`,
    },
  ];
  return { normalized, steps };
}
