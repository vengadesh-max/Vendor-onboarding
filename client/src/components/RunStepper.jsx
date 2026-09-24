const STAGE_ORDER = [
  'intake',
  'structural',
  'semantic',
  'decision',
  'communication',
];

const STAGE_LABELS = {
  intake: 'Intake',
  structural: 'Structural validation',
  semantic: 'Semantic validation',
  decision: 'Decision',
  communication: 'Communication',
};

function resultIcon(result) {
  if (result === 'pass') return '✅';
  if (result === 'warn') return '⚠️';
  return '❌';
}

export default function RunStepper({ steps, animate = false, visibleCount = null }) {
  const grouped = STAGE_ORDER.map((stage) => ({
    stage,
    label: STAGE_LABELS[stage],
    steps: (steps || []).filter((s) => s.stage === stage),
  })).filter((g) => g.steps.length > 0);

  const limit = animate && visibleCount != null ? visibleCount : Infinity;

  return (
    <ol className="space-y-6 border-l-2 border-slate-200 pl-4 ml-2">
      {grouped.map(({ stage, label, steps: stageSteps }) => (
        <li key={stage} className="relative">
          <span className="absolute -left-[1.35rem] top-0 h-3 w-3 rounded-full bg-slate-400 ring-4 ring-slate-50" />
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500 mb-2">
            {label}
          </h3>
          <ul className="space-y-2">
            {stageSteps.map((step, idx) => {
              const globalIndex = steps.indexOf(step);
              if (animate && globalIndex >= limit) return null;
              return (
                <li
                  key={`${step.step_name}-${idx}`}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm"
                >
                  <div className="flex gap-2">
                    <span aria-hidden>{resultIcon(step.result)}</span>
                    <div>
                      <p className="font-medium text-slate-800">{step.step_name.replace(/_/g, ' ')}</p>
                      <p className="text-slate-600 mt-0.5">{step.detail}</p>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </li>
      ))}
    </ol>
  );
}

export function statusBadgeClass(status) {
  if (status === 'approved') return 'bg-emerald-100 text-emerald-800 border-emerald-200';
  if (status === 'pending') return 'bg-amber-100 text-amber-900 border-amber-200';
  return 'bg-red-100 text-red-800 border-red-200';
}
