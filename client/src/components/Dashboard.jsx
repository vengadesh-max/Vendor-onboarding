import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { statusBadgeClass } from './RunStepper.jsx';

export default function Dashboard() {
  const [runs, setRuns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('/api/runs')
      .then(async (r) => {
        const text = await r.text();
        if (!r.ok) throw new Error(`Server error (${r.status}): ${text.slice(0, 100)}`);
        return text ? JSON.parse(text) : [];
      })
      .then(setRuns)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-slate-600">Loading runs…</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Run history</h1>
      {runs.length === 0 ? (
        <p className="text-slate-600">
          No runs yet. <Link to="/" className="text-blue-600 underline">Submit a vendor</Link>
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-left text-slate-600">
              <tr>
                <th className="px-4 py-3 font-semibold">Company</th>
                <th className="px-4 py-3 font-semibold">Submitted</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Duration</th>
                <th className="px-4 py-3 font-semibold" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {runs.map((run) => (
                <tr key={run.id} className="hover:bg-slate-50/80">
                  <td className="px-4 py-3 font-medium text-slate-900">{run.company_name}</td>
                  <td className="px-4 py-3 text-slate-600">
                    {new Date(run.submitted_at).toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-0.5 rounded-full border text-xs font-semibold uppercase ${statusBadgeClass(run.status)}`}>
                      {run.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{run.duration_ms} ms</td>
                  <td className="px-4 py-3 text-right">
                    <Link to={`/dashboard/${run.id}`} className="text-blue-600 font-medium hover:underline">
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
