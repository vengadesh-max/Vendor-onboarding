import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import RunStepper, { statusBadgeClass } from './RunStepper.jsx';

export default function RunDetail() {
  const { id } = useParams();
  const [run, setRun] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  if (loading) return <p className="text-slate-600">Loading run…</p>;
  if (error) return <p className="text-red-600">{error}</p>;
  if (!run) return null;

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <Link to="/dashboard" className="text-sm text-blue-600 hover:underline">← Dashboard</Link>
        <h1 className="text-2xl font-bold text-slate-900 mt-2">Run #{run.run_id}</h1>
        <p className="text-slate-600">{new Date(run.submitted_at).toLocaleString()}</p>
      </div>

      <RunStepper steps={run.steps} />

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <span className={`inline-flex px-3 py-1 rounded-full border text-sm font-semibold uppercase ${statusBadgeClass(run.status)}`}>
          {run.status}
        </span>
        <div>
          <h2 className="text-sm font-semibold text-slate-700">Reasoning</h2>
          <p className="text-slate-800 mt-1">{run.final_reasoning}</p>
        </div>
        {run.drafted_message && (
          <div>
            <h2 className="text-sm font-semibold text-slate-700">Drafted vendor message</h2>
            <pre className="mt-2 whitespace-pre-wrap rounded-lg bg-slate-50 border border-slate-200 p-4 text-sm">
              {run.drafted_message}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
