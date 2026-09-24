import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import RunStepper, { statusBadgeClass } from './RunStepper.jsx';

const REVEAL_MS = 500;

export default function LiveRunView({ run }) {
  const steps = run?.steps || [];
  const [visibleCount, setVisibleCount] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!steps.length || !run?.run_id) return;
    const cacheKey = `run_animated_${run.run_id}`;
    if (sessionStorage.getItem(cacheKey)) {
      setVisibleCount(steps.length);
      setDone(true);
      return;
    }

    setVisibleCount(0);
    setDone(false);
    let i = 0;
    const id = setInterval(() => {
      i += 1;
      setVisibleCount(i);
      if (i >= steps.length) {
        clearInterval(id);
        setDone(true);
        sessionStorage.setItem(cacheKey, 'true');
      }
    }, REVEAL_MS);
    return () => clearInterval(id);
  }, [run?.run_id, steps.length]);

  if (!run) {
    return (
      <p className="text-slate-600">
        No run data. <Link className="text-blue-600 underline" to="/">Submit a vendor</Link>
      </p>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Live run</h1>
        <p className="text-slate-600 mt-1">Run #{run.run_id} — stages replay from recorded pipeline output.</p>
      </div>

      <RunStepper steps={steps} animate visibleCount={visibleCount} />

      {done && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-slate-500">Final status</span>
            <span
              className={`inline-flex px-3 py-1 rounded-full border text-sm font-semibold uppercase ${statusBadgeClass(run.status)}`}
            >
              {run.status}
            </span>
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-700">Reasoning</h2>
            <p className="text-slate-800 mt-1">{run.final_reasoning}</p>
          </div>
          {run.drafted_message && (
            <div>
              <h2 className="text-sm font-semibold text-slate-700">Drafted vendor message</h2>
              <pre className="mt-2 whitespace-pre-wrap rounded-lg bg-slate-50 border border-slate-200 p-4 text-sm text-slate-800 font-sans">
                {run.drafted_message}
              </pre>
            </div>
          )}
          <Link
            to={`/dashboard/${run.run_id}`}
            className="inline-block text-blue-600 font-medium hover:underline"
          >
            View in dashboard →
          </Link>
        </div>
      )}
    </div>
  );
}
