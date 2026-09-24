# Vendor Onboarding Automation — Zamp AI (PS-2 Case Study)

An AI-native vendor onboarding and compliance qualification engine built for Zamp AI. Combines deterministic structural validation in code with Google Gemini AI for fuzzy entity matching, document consistency evaluation, and automated vendor follow-up communication.

---

## 🌟 Key Features

- **Hybrid Audit Architecture**: Deterministic rules (format regex, field presence, registry duplicate checks) execute instantly in code. Google Gemini AI (`gemini-2.5-flash`) handles ambiguous fuzzy judgment calls.
- **Zamp UI Experience**: Crisp, high-contrast Zamp AI brand interface with interactive preset quick-loaders, live stepper execution view, and audit dashboard history.
- **Database Versatility**: Native PostgreSQL client (`pg` Pool) for Vercel / Neon serverless deployment with automatic zero-config SQLite / in-memory fallback for local dev.
- **Sub-Second Execution**: Sub-second request processing time with rate-limit throttling and exponential backoff retry logic.

---

## 🚀 Quick Start (Local Development)

1. **Clone & Configure Environment**:
   ```bash
   cp .env.example .env
   ```
   Add your Google Gemini API key to `.env`:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   GEMINI_MODEL=gemini-2.5-flash
   ```

2. **Install Dependencies & Start**:
   ```bash
   npm run dev
   ```
   - **Frontend App**: `http://localhost:5173`
   - **Backend API Engine**: `http://localhost:4000`
   - **Swagger OpenAPI Specs**: `http://localhost:4000/swagger`
   - **Health Check**: `http://localhost:4000/api/health`

---

## 🧪 Testing Suite

```bash
# Test Gemini API connectivity
npm run test:gemini --prefix server

# Run end-to-end test pass across all 5 sample presets
npm run test:e2e
```

---

## ⚡ 5 Test Presets (Covering Edge Cases)

1. **Happy Path**: Complete valid submission → `APPROVED`
2. **Name Mismatch**: Company "Sharma Global Exports" vs Bank Holder "R. Sharma Trading" → `PENDING` (Gemini fuzzy evaluation + drafted email)
3. **Wrong Tax ID Format**: Country `US` with invalid tax format → `REJECTED`
4. **Missing Document**: Missing `bank_confirmation_letter` → `PENDING` (Follow-up email drafted)
5. **Duplicate Vendor**: Matching existing registry Tax ID / Bank Account → `REJECTED` (Fraud risk flag)

---

## 🌐 Production Deployment (Vercel)

1. Provision Postgres (Vercel Storage or Neon pooled connection string).
2. Set Environment Variables in Vercel Dashboard: `DATABASE_URL`, `GEMINI_API_KEY`, `GEMINI_MODEL`.
3. Deploy:
   ```bash
   vercel --prod
   ```

See `ASSUMPTIONS.md` for full architectural rationale and design choices.
