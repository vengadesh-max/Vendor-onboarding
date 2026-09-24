import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Download, 
  ArrowLeft, 
  Building2, 
  Globe, 
  FileText, 
  Calendar, 
  Mail, 
  Clock, 
  Copy, 
  Check, 
  ShieldCheck
} from 'lucide-react';
import RunStepper, { statusBadgeClass } from './RunStepper.jsx';

export default function RunDetail() {
  const { id } = useParams();
  const [run, setRun] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/runs/${id}`)
      .then(async (r) => {
        const text = await r.text();
        if (!r.ok) throw new Error(`Run not found (${r.status})`);
        return text ? JSON.parse(text) : null;
      })
      .then(setRun)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  const handleDownloadPdf = () => {
    window.print();
  };

  const handleCopyMessage = () => {
    if (run?.drafted_message) {
      navigator.clipboard.writeText(run.drafted_message);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-3 text-slate-600 font-medium">
          <span className="w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
          Loading audit report details…
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-xl mx-auto p-6 rounded-xl bg-red-50 border border-red-200 text-red-800 text-center">
        <AlertTriangle className="w-8 h-8 text-red-600 mx-auto mb-2" />
        <h2 className="text-lg font-bold">Error Loading Run</h2>
        <p className="text-sm mt-1">{error}</p>
        <Link to="/dashboard" className="inline-flex items-center gap-1 mt-4 text-sm font-semibold text-blue-600 hover:underline">
          <ArrowLeft className="w-4 h-4" /> Back to Audit Dashboard
        </Link>
      </div>
    );
  }

  if (!run) return null;

  const rawInput = run.input || run.input_json || {};
  const vendorData = typeof rawInput === 'string' ? (JSON.parse(rawInput) || {}) : (rawInput || {});
  const statusUpper = (run.status || 'unknown').toUpperCase();
  const runId = run.run_id || run.id || id;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Action Bar (Hidden when printing) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4 print:hidden">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>

        <button
          onClick={handleDownloadPdf}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm shadow-sm transition-all active:scale-[0.98]"
        >
          <Download className="w-4 h-4" />
          Download Audit Report (PDF)
        </button>
      </div>

      {/* Main Printable Audit Report Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-8 print:border-none print:p-0 print:shadow-none">
        
        {/* Header Block */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-slate-100 pb-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
              <ShieldCheck className="w-4 h-4 text-slate-700" />
              Official Compliance Audit Report
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              {vendorData.company_name || run.company_name || 'Vendor Compliance Audit'}
            </h1>
            <p className="text-sm text-slate-500 mt-1 flex items-center gap-4 flex-wrap">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                {new Date(run.submitted_at).toLocaleString()}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                Processing Time: {run.duration_ms || 0} ms
              </span>
            </p>
          </div>

          {/* Status Badge */}
          <div className="self-start">
            <span
              className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full border text-xs font-bold uppercase tracking-wide ${statusBadgeClass(
                run.status
              )}`}
            >
              {run.status === 'approved' && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
              {run.status === 'pending' && <AlertTriangle className="w-4 h-4 text-amber-600" />}
              {run.status === 'rejected' && <XCircle className="w-4 h-4 text-red-600" />}
              {statusUpper}
            </span>
          </div>
        </div>

        {/* Vendor Master Information Grid */}
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
            Vendor Submission Profile
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 bg-slate-50/80 p-4 rounded-xl border border-slate-200/80 text-sm">
            <div>
              <span className="text-xs text-slate-500 block font-medium">Company Name</span>
              <span className="font-semibold text-slate-900">{vendorData.company_name || 'N/A'}</span>
            </div>
            <div>
              <span className="text-xs text-slate-500 block font-medium">Country Code</span>
              <span className="font-semibold text-slate-900">{vendorData.country || 'N/A'}</span>
            </div>
            <div>
              <span className="text-xs text-slate-500 block font-medium">Tax Identifier</span>
              <span className="font-mono text-slate-900 font-semibold">{vendorData.tax_id || 'N/A'}</span>
            </div>
            <div>
              <span className="text-xs text-slate-500 block font-medium">Bank Account Number</span>
              <span className="font-mono text-slate-900 font-semibold">{vendorData.bank_account_number || 'N/A'}</span>
            </div>
            <div>
              <span className="text-xs text-slate-500 block font-medium">Contact Email</span>
              <span className="text-slate-900 font-medium">{vendorData.email || 'N/A'}</span>
            </div>
            <div>
              <span className="text-xs text-slate-500 block font-medium">Required Documents</span>
              <span className="text-slate-900 font-medium">
                {Array.isArray(vendorData.required_documents)
                  ? vendorData.required_documents.join(', ')
                  : 'None provided'}
              </span>
            </div>
          </div>
        </div>

        {/* Executive Decision Summary */}
        <div className="space-y-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Executive Compliance Finding
          </h2>
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
            <p className="text-slate-800 leading-relaxed font-medium">
              {run.final_reasoning}
            </p>
          </div>
        </div>

        {/* Structured Pipeline Audit Execution Steps */}
        <div className="space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Audit Check Sequence
          </h2>
          <RunStepper steps={run.steps} />
        </div>

        {/* Formatted Drafted Vendor Communication (if present) */}
        {run.drafted_message && (
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5" />
                Drafted Vendor Communication
              </h2>
              <button
                onClick={handleCopyMessage}
                className="text-xs font-medium text-slate-600 hover:text-slate-900 flex items-center gap-1 px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 transition-colors print:hidden"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied' : 'Copy Message'}
              </button>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-900 text-slate-100 p-5 font-mono text-xs leading-relaxed whitespace-pre-wrap shadow-inner print:bg-slate-50 print:text-slate-900 print:border-slate-300">
              {run.drafted_message}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
