const baseDocs = (overrides = {}) => ({
  business_registration_cert: {
    provided: true,
    extracted_name: 'Acme Exports Pvt Ltd',
    extracted_address: '123 MG Road, Bengaluru',
    ...overrides.business_registration_cert,
  },
  tax_certificate: {
    provided: true,
    extracted_name: 'Acme Exports Pvt Ltd',
    extracted_address: '123 MG Road, Bengaluru',
    ...overrides.tax_certificate,
  },
  bank_confirmation_letter: {
    provided: true,
    ...overrides.bank_confirmation_letter,
  },
});

export const SAMPLE_PRESETS = [
  {
    id: 'happy',
    label: 'Happy path — should APPROVE',
    data: {
      company_name: 'Acme Exports Pvt Ltd',
      country: 'IN',
      tax_id: '27AAAPL1234C1Z5',
      bank_account_holder_name: 'Acme Exports Pvt Ltd',
      bank_account_number: '000123456789',
      bank_name: 'HDFC Bank',
      swift_or_ifsc: 'HDFC0000123',
      contact_email: 'finance@acmeexports.com',
      contact_phone: '+91-9876543210',
      documents: baseDocs(),
    },
  },
  {
    id: 'name_mismatch',
    label: 'Name mismatch — should PENDING',
    data: {
      company_name: 'Sharma Global Exports Ltd',
      country: 'IN',
      tax_id: '27AABCS1429B2Z6',
      bank_account_holder_name: 'R. Sharma Trading',
      bank_account_number: '000987654321',
      bank_name: 'ICICI Bank',
      swift_or_ifsc: 'ICIC0000456',
      contact_email: 'ops@sharmaglobal.in',
      contact_phone: '+91-9123456789',
      documents: baseDocs({
        business_registration_cert: {
          provided: true,
          extracted_name: 'Sharma Global Exports Ltd',
          extracted_address: '45 Industrial Area, Mumbai',
        },
        tax_certificate: {
          provided: true,
          extracted_name: 'Sharma Global Exports Ltd',
          extracted_address: '45 Industrial Area, Mumbai',
        },
      }),
    },
  },
  {
    id: 'wrong_tax_format',
    label: 'Wrong tax ID for US — should REJECT',
    data: {
      company_name: 'Midwest Parts Co',
      country: 'US',
      tax_id: '27AAAPL1234C1Z5',
      bank_account_holder_name: 'Midwest Parts Co',
      bank_account_number: '445566778899',
      bank_name: 'Chase',
      swift_or_ifsc: 'CHASUS33',
      contact_email: 'ap@midwestparts.com',
      contact_phone: '+1-555-0100',
      documents: baseDocs({
        business_registration_cert: {
          provided: true,
          extracted_name: 'Midwest Parts Co',
          extracted_address: '100 Lake St, Chicago IL',
        },
        tax_certificate: {
          provided: true,
          extracted_name: 'Midwest Parts Co',
          extracted_address: '100 Lake St, Chicago IL',
        },
      }),
    },
  },
  {
    id: 'missing_doc',
    label: 'Missing bank letter — should PENDING',
    data: {
      company_name: 'Blue Harbor Services',
      country: 'GB',
      tax_id: 'GB999888777',
      bank_account_holder_name: 'Blue Harbor Services Ltd',
      bank_account_number: '778899001122',
      bank_name: 'Barclays',
      swift_or_ifsc: 'BARCGB22',
      contact_email: 'vendor@blueharbor.co.uk',
      contact_phone: '+44-20-7946-0958',
      documents: baseDocs({
        bank_confirmation_letter: { provided: false },
        business_registration_cert: {
          provided: true,
          extracted_name: 'Blue Harbor Services Ltd',
          extracted_address: '10 Harbour Rd, London',
        },
        tax_certificate: {
          provided: true,
          extracted_name: 'Blue Harbor Services Ltd',
          extracted_address: '10 Harbour Rd, London',
        },
      }),
    },
  },
  {
    id: 'duplicate',
    label: 'Duplicate vendor (Globex) — should REJECT',
    data: {
      company_name: 'Globex Impersonator LLC',
      country: 'US',
      tax_id: '12-3456789',
      bank_account_holder_name: 'Globex Impersonator LLC',
      bank_account_number: '111222333444',
      bank_name: 'Wells Fargo',
      swift_or_ifsc: 'WFBIUS6S',
      contact_email: 'fake@globex-impersonator.com',
      contact_phone: '+1-555-0199',
      documents: baseDocs({
        business_registration_cert: {
          provided: true,
          extracted_name: 'Globex Impersonator LLC',
          extracted_address: '1 Fake St, Wilmington DE',
        },
        tax_certificate: {
          provided: true,
          extracted_name: 'Globex Impersonator LLC',
          extracted_address: '1 Fake St, Wilmington DE',
        },
      }),
    },
  },
];
