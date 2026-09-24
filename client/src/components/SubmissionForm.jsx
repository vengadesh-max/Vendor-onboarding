import { useState } from 'react';
import { SAMPLE_PRESETS } from '../samples/presets.js';

const emptyForm = () => ({
  company_name: '',
  country: 'IN',
  tax_id: '',
  bank_account_holder_name: '',
  bank_account_number: '',
  bank_name: '',
  swift_or_ifsc: '',
  contact_email: '',
  contact_phone: '',
  documents: {
    business_registration_cert: { provided: true, extracted_name: '', extracted_address: '' },
    tax_certificate: { provided: true, extracted_name: '', extracted_address: '' },
    bank_confirmation_letter: { provided: true },
  },
});

function Field({ label, children, mono }) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <div className={mono ? 'font-mono-data mt-1' : 'mt-1'}>{children}</div>
    </label>
  );
}

export default function SubmissionForm({ onSubmitted, loading, setLoading }) {
  const [form, setForm] = useState(emptyForm());
  const [presetId, setPresetId] = useState('');
  const [error, setError] = useState(null);

  const update = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const updateDoc = (docKey, patch) =>
    setForm((f) => ({
      ...f,
      documents: {
        ...f.documents,
        [docKey]: { ...f.documents[docKey], ...patch },
      },
    }));

  const loadPreset = (id) => {
    setPresetId(id);
    const preset = SAMPLE_PRESETS.find((p) => p.id === id);
    if (preset) setForm(JSON.parse(JSON.stringify(preset.data)));
  };

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const text = await res.text();
      let data = {};
      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        throw new Error(`Server returned non-JSON response (${res.status}): ${text.slice(0, 100)}`);
      }
      if (!res.ok) throw new Error(data.error || `Submit failed with status ${res.status}`);
      onSubmitted(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    'w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500';

  return (
    <form onSubmit={submit} className="max-w-3xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end gap-4 rounded-lg border border-blue-100 bg-blue-50/50 p-4">
        <Field label="Load sample">
          <select
            className={inputClass}
            value={presetId}
            onChange={(e) => loadPreset(e.target.value)}
          >
            <option value="">— Select preset —</option>
            {SAMPLE_PRESETS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </select>
        </Field>
        <p className="text-xs text-slate-600 sm:flex-1">
          Presets cover happy path plus edge cases (name mismatch, tax format, missing doc, duplicate).
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold border-b border-slate-200 pb-2">Company info</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Company name">
            <input className={inputClass} value={form.company_name} onChange={(e) => update('company_name', e.target.value)} required />
          </Field>
          <Field label="Country (ISO)">
            <input className={`${inputClass} font-mono-data`} value={form.country} onChange={(e) => update('country', e.target.value)} required />
          </Field>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold border-b border-slate-200 pb-2">Tax & registration</h2>
        <Field label="Tax ID" mono>
          <input className={inputClass} value={form.tax_id} onChange={(e) => update('tax_id', e.target.value)} required />
        </Field>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold border-b border-slate-200 pb-2">Banking</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Account holder name">
            <input className={inputClass} value={form.bank_account_holder_name} onChange={(e) => update('bank_account_holder_name', e.target.value)} required />
          </Field>
          <Field label="Account number" mono>
            <input className={inputClass} value={form.bank_account_number} onChange={(e) => update('bank_account_number', e.target.value)} required />
          </Field>
          <Field label="Bank name">
            <input className={inputClass} value={form.bank_name} onChange={(e) => update('bank_name', e.target.value)} required />
          </Field>
          <Field label="SWIFT / IFSC" mono>
            <input className={inputClass} value={form.swift_or_ifsc} onChange={(e) => update('swift_or_ifsc', e.target.value)} required />
          </Field>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold border-b border-slate-200 pb-2">Contact</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Email">
            <input type="email" className={inputClass} value={form.contact_email} onChange={(e) => update('contact_email', e.target.value)} required />
          </Field>
          <Field label="Phone">
            <input className={inputClass} value={form.contact_phone} onChange={(e) => update('contact_phone', e.target.value)} required />
          </Field>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold border-b border-slate-200 pb-2">Documents (simulated extraction)</h2>
        {['business_registration_cert', 'tax_certificate', 'bank_confirmation_letter'].map((key) => (
          <div key={key} className="rounded-lg border border-slate-200 p-4 space-y-3">
            <label className="flex items-center gap-2 text-sm font-medium">
              <input
                type="checkbox"
                checked={form.documents[key].provided}
                onChange={(e) => updateDoc(key, { provided: e.target.checked })}
              />
              {key.replace(/_/g, ' ')} — provided
            </label>
            {key !== 'bank_confirmation_letter' && (
              <div className="grid sm:grid-cols-2 gap-3">
                <Field label="Extracted name">
                  <input
                    className={`${inputClass} font-mono-data text-xs`}
                    value={form.documents[key].extracted_name || ''}
                    onChange={(e) => updateDoc(key, { extracted_name: e.target.value })}
                  />
                </Field>
                <Field label="Extracted address">
                  <input
                    className={`${inputClass} font-mono-data text-xs`}
                    value={form.documents[key].extracted_address || ''}
                    onChange={(e) => updateDoc(key, { extracted_address: e.target.value })}
                  />
                </Field>
              </div>
            )}
          </div>
        ))}
      </section>

      {error && (
        <p className="text-red-700 text-sm rounded-md bg-red-50 border border-red-200 px-3 py-2">{error}</p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Running pipeline…' : 'Submit for onboarding'}
      </button>
    </form>
  );
}
