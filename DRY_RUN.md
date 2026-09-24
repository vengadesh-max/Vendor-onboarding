# 🧪 Vendor Onboarding — Dry Run & Local Testing Guide

This guide explains how to submit custom vendor payloads and test the 5-stage automated compliance pipeline using either the Web UI or the REST API.

---

## 🚀 How to Enter & Validate New Vendor Details

You can submit any custom vendor details through the Web UI or via the REST API.

### Option 1: Via the Web Interface (UI Form)

1. Open the app home page (click **New Submission** in the top-right header).
2. On the **Vendor Intake Form**, you can either:
   - **Click a Quick Preset** (*Happy Path*, *Tax ID Mismatch*, *Bank Holder Mismatch*, *Duplicate Vendor Check*) to auto-fill sample data.
   - **OR enter custom vendor details into the fields**:
     - **Company Name**: e.g. `Zenith Tech Systems Pvt Ltd`
     - **Country Jurisdiction**: Select `IN` (India), `US` (United States), `GB` (UK), or `DE` (Germany).
     - **Tax Identifier**: e.g. `22AAAAA0000A1Z5` for IN, `12-3456789` for US.
     - **Bank Account Number**: e.g. `9876543210`
     - **Contact Email**: e.g. `accounts@zenithtech.com`
     - **Extracted Document Fields**: Fill in the bank account holder name or tax address extracted from compliance documents.
     - **Attached Compliance Documents**: Check off `Tax Certificate` or `Bank Confirmation Letter`.
3. Click **Run Vendor Onboarding Pipeline**.

---

### Option 2: Via REST API (cURL or Postman)

You can send custom JSON payloads directly to the API endpoint `POST /api/runs/submit`:

```bash
# Production / Vercel API
curl -X POST https://vendor-onboarding-84g7.vercel.app/api/runs/submit \
  -H "Content-Type: application/json" \
  -d '{
    "company_name": "Zenith Tech Systems Pvt Ltd",
    "country": "IN",
    "tax_id": "22AAAAA0000A1Z5",
    "bank_account_number": "9876543210",
    "email": "accounts@zenithtech.com",
    "extracted_bank_holder_name": "Zenith Tech Systems Pvt Ltd",
    "required_documents": ["tax_certificate", "bank_letter"]
  }'

# Local API
curl -X POST http://localhost:4000/api/runs/submit \
  -H "Content-Type: application/json" \
  -d '{
    "company_name": "Zenith Tech Systems Pvt Ltd",
    "country": "IN",
    "tax_id": "22AAAAA0000A1Z5",
    "bank_account_number": "9876543210",
    "email": "accounts@zenithtech.com",
    "extracted_bank_holder_name": "Zenith Tech Systems Pvt Ltd",
    "required_documents": ["tax_certificate", "bank_letter"]
  }'
```

---

## ⚙️ How the Pipeline Validates Your Input (Stage by Stage)

When submitted, your input is processed in real time through 5 stages:

| Stage | Validation Mechanism | What Happens |
| :--- | :--- | :--- |
| **Stage 1: Intake** | Sanitization | Normalizes legal company name, trims inputs, and structures the payload. |
| **Stage 2: Structural** | Code (Regex & DB) | Checks required fields, validates Tax ID against country-specific regex, and checks PostgreSQL for duplicate registrations. |
| **Stage 3: Semantic** | Google Gemini AI | Performs fuzzy name matching (comparing legal company name vs. bank account holder name) and document consistency evaluation. |
| **Stage 4: Decision** | Rule Aggregator | Aggregates all step findings into a final outcome (`APPROVED`, `PENDING REVIEW`, `REJECTED`) with an audit explanation. |
| **Stage 5: Communication** | Google Gemini AI | If not approved, drafts a tailored vendor follow-up message explaining what documents or corrections are required. |

---

## 🎯 Pre-Packaged Edge Case Test Scenarios

### Scenario 1: Happy Path (`APPROVED`)
```json
{
  "company_name": "Acme Exports Pvt Ltd",
  "country": "IN",
  "tax_id": "22AAAAA0000A1Z5",
  "bank_account_number": "9876543210",
  "email": "vendor@acme-exports.com",
  "extracted_bank_holder_name": "Acme Exports Pvt Ltd",
  "required_documents": ["tax_certificate", "bank_letter"]
}
```
* **Expected Result**: `APPROVED` — All structural, tax regex, and fuzzy LLM checks pass.

---

### Scenario 2: Tax ID Jurisdiction Mismatch (`REJECTED`)
```json
{
  "company_name": "Global Tech Germany GmbH",
  "country": "IN",
  "tax_id": "DE123456789",
  "bank_account_number": "9876543210",
  "email": "info@globaltech.de",
  "extracted_bank_holder_name": "Global Tech Germany GmbH",
  "required_documents": ["tax_certificate", "bank_letter"]
}
```
* **Expected Result**: `REJECTED` — `DE123456789` fails India GSTIN/PAN tax format regex.

---

### Scenario 3: Corporate vs. Individual Bank Holder Discrepancy (`PENDING REVIEW`)
```json
{
  "company_name": "Sharma Global Exports Ltd",
  "country": "IN",
  "tax_id": "22AAAAA0000A1Z5",
  "bank_account_number": "9876543210",
  "email": "contact@sharmaglobal.com",
  "extracted_bank_holder_name": "Rajesh Sharma",
  "required_documents": ["tax_certificate", "bank_letter"]
}
```
* **Expected Result**: `PENDING REVIEW` — Gemini LLM flags sole proprietorship name discrepancy and drafts a vendor authorization email.

---

### Scenario 4: Duplicate Registry Detection (`REJECTED`)
```json
{
  "company_name": "Duplicate Acme Corp",
  "country": "IN",
  "tax_id": "22AAAAA0000A1Z5",
  "bank_account_number": "9876543210",
  "email": "dup@acme.com",
  "extracted_bank_holder_name": "Duplicate Acme Corp",
  "required_documents": ["tax_certificate", "bank_letter"]
}
```
* **Expected Result**: `REJECTED` — Tax ID and bank account match existing active vendor in PostgreSQL.
