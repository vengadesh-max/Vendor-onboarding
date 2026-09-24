import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  FileText, 
  ChevronRight, 
  Clock, 
  Building2, 
  Plus,
  RefreshCw
} from 'lucide-react';
import { statusBadgeClass } from './RunStepper.jsx';

export default function Dashboard() {
  const [runs, setRuns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchRuns = () => {
    setLoading(true);
    fetch('/api/runs')
      .then(async (r) => {
        const text = await r.text();
        if (!r.ok) throw new Error(`Server error (${r.status}): ${text.slice(0, 100)}`);
        return text ? JSON.parse(text) : [];
      })
      .then(setRuns)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchRuns();
  }, []);

  if (loading && runs.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[350px]">
        <div className="flex items-center gap-3 text-slate-600 font-medium">
          <span className="w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
          Loading audit runs history…
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-xl mx-auto p-6 rounded-xl bg-red-50 border border-red-200 text-red-800 text-center">
        <AlertTriangle className="w-8 h-8 text-red-600 mx-auto mb-2" />
        <h2 className="text-lg font-bold">Error Loading Runs</h2>
        <p className="text-sm mt-1">{error}</p>
        <button
          onClick={fetchRuns}
          className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-slate-900 text-white font-semibold text-xs rounded-lg hover:bg-slate-800 transition-all"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Retry
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Audit Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">
            Complete compliance audit history and generated vendor reports
          </p>
        </div>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          New Vendor Intake
        </Link>
      </div>

      {runs.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center space-y-3">
          <Building2 className="w-10 h-10 text-slate-400 mx-auto" />
          <h2 className="text-lg font-bold text-slate-800">No Audit Runs Recorded Yet</h2>
          <p className="text-sm text-slate-500 max-w-sm mx-auto">
            Submit a vendor through the intake pipeline to generate automated compliance checks and reports.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 mt-2 px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-lg hover:bg-slate-800"
          >
            Submit First Vendor
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-5 py-3.5">Vendor / Company</th>
                <th className="px-5 py-3.5">Submitted Timestamp</th>
                <th className="px-5 py-3.5">Compliance Status</th>
                <th className="px-5 py-3.5">Pipeline Latency</th>
                <th className="px-5 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {runs.map((run) => {
                const runId = run.id || run.run_id;
                return (
                  <tr key={runId} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-4 font-semibold text-slate-900 flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
                      <span>{run.company_name || 'Vendor Submission'}</span>
                    </td>
                    <td className="px-5 py-4 text-slate-600 font-medium">
                      {new Date(run.submitted_at).toLocaleString()}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full border text-xs font-bold uppercase ${statusBadgeClass(
                          run.status
                        )}`}
                      >
                        {run.status === 'approved' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                        {run.status === 'pending' && <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />}
                        {run.status === 'rejected' && <XCircle className="w-3.5 h-3.5 text-red-600" />}
                        {run.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-slate-500 font-mono text-xs flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {run.duration_ms || 0} ms
                    </td>
                    <td className="px-5 py-4 text-right">
                      <Link
                        to={`/dashboard/${runId}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs transition-colors"
                      >
                        <FileText className="w-3.5 h-3.5 text-slate-500" />
                        View Report
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
