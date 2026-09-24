export const SEED_VENDORS = [
  {
    company_name: 'Globex Trading LLC',
    tax_id: '12-3456789',
    bank_account_number: '9876543210',
    country: 'US',
  },
  {
    company_name: 'Nordic Supplies GmbH',
    tax_id: 'DE123456789',
    bank_account_number: 'DE89370400440532013000',
    country: 'DE',
  },
  {
    company_name: 'Brighton Retail Ltd',
    tax_id: 'GB123456789',
    bank_account_number: '112233445566',
    country: 'GB',
  },
  {
    company_name: 'Sunrise Pharma Pvt Ltd',
    tax_id: '29AABCS1429B1Z5',
    bank_account_number: '50100234567890',
    country: 'IN',
  },
  {
    company_name: 'Pacific Logistics Inc',
    tax_id: '98-7654321',
    bank_account_number: '000111222333',
    country: 'US',
  },
  {
    company_name: 'Alpine Components AG',
    tax_id: 'DE987654321',
    bank_account_number: 'CH9300762011623852957',
    country: 'DE',
  },
  {
    company_name: 'Coastal Foods LLP',
    tax_id: '07AAACC1206D1Z8',
    bank_account_number: '334455667788',
    country: 'IN',
  },
];

/** @param {import('better-sqlite3').Database | null} db ignored — kept for API compat */
export function seedVendorsIfEmpty(db) {
  void db;
  return SEED_VENDORS;
}
