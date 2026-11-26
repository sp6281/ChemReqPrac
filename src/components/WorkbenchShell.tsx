import React, { useState } from 'react';
import {
  CheckCircle2,
  Circle,
  RotateCcw,
  ShieldAlert,
  ChevronLeft,
} from 'lucide-react';
import { PRACTICALS, PRACTICAL_MAP } from '../data/practicals';
import { PracticalId } from '../types/lab';
import { useLab } from '../context/LabContext';

interface WorkbenchShellProps {
  practicalId: PracticalId;
  onSelectPractical: (id: PracticalId) => void;
  onBackToDirectory: () => void;
  children: React.ReactNode;
  dataPanel?: React.ReactNode;
  onResetLocal?: () => void;
}

type SideTab = 'protocol' | 'data' | 'notes' | 'safety';

export const WorkbenchShell: React.FC<WorkbenchShellProps> = ({
  practicalId,
  onSelectPractical,
  onBackToDirectory,
  children,
  dataPanel,
  onResetLocal,
}) => {
  const [sideTab, setSideTab] = useState<SideTab>('protocol');
  const [confirmReset, setConfirmReset] = useState(false);
  const { state, toggleStep, updateObservations, updateConclusion, resetPractical, getPracticalCompletion } =
    useLab();

  const meta = PRACTICAL_MAP[practicalId];
  const nb = state.notebooks[practicalId];
  const completion = getPracticalCompletion(practicalId);

  const handleReset = () => {
    resetPractical(practicalId);
    onResetLocal?.();
    setConfirmReset(false);
  };

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-6 space-y-5">
      {/* Compact practical switcher toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={onBackToDirectory}
            className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 hover:text-slate-900 whitespace-nowrap shrink-0 cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" aria-hidden="true" />
            All Practicals
          </button>
          <span className="text-slate-300" aria-hidden="true">
            /
          </span>
          <div className="min-w-0">
            <h1 className="text-lg font-bold text-slate-900 truncate">
              Practical {meta.number}: {meta.title}
            </h1>
            <p className="text-xs text-slate-500 truncate">
              {meta.aqaRef} · {meta.apparatusCodes.join(', ')} · {meta.separateOnly ? 'Separate Chemistry Only' : 'Combined & Separate'}
            </p>
          </div>
        </div>

        {/* 1-8 segmented switcher */}
        <div
          role="navigation"
          aria-label="Switch practical"
          className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg overflow-x-auto shrink-0"
        >
          {PRACTICALS.map((p) => {
            const active = p.id === practicalId;
            const c = getPracticalCompletion(p.id);
            const done = c.done === c.total;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => onSelectPractical(p.id)}
                title={`Practical ${p.number}: ${p.shortTitle}`}
                className={`px-2.5 py-1.5 text-xs font-mono font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  active
                    ? 'bg-white text-blue-700 shadow-xs'
                    : done
                    ? 'text-emerald-700 hover:bg-white/60'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                RP {p.number}
              </button>
            );
          })}
        </div>
      </div>

      {/* Two-zone interactive workbench */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Left 62% Interactive Apparatus Stage */}
        <div className="xl:col-span-8 space-y-5">
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            {children}
          </div>

          {/* Chemical equation & aim footer strip */}
          <div className="bg-white border border-slate-200 rounded-xl px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-0.5">
              <p className="text-xs text-slate-500">Key Reaction / Relationship</p>
              <p className="text-xs sm:text-sm font-mono font-medium text-slate-900">
                {meta.equation}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {!confirmReset ? (
                <button
                  type="button"
                  onClick={() => setConfirmReset(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                  Reset Practical
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={handleReset}
                    className="px-3 py-1.5 text-xs font-medium text-white bg-rose-600 hover:bg-rose-700 rounded-lg whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    Confirm Reset
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmReset(false)}
                    className="px-2.5 py-1.5 text-xs text-slate-600 hover:text-slate-900 whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    Cancel
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right 38% Protocol, Data, Notes & Safety Deck */}
        <aside className="xl:col-span-4 bg-white border border-slate-200 rounded-xl overflow-hidden flex flex-col">
          <div className="p-2 bg-slate-50 border-b border-slate-200">
            <div role="tablist" aria-label="Lab deck sections" className="grid grid-cols-4 gap-1">
              {(
                [
                  { id: 'protocol', label: 'Method' },
                  { id: 'data', label: 'Data' },
                  { id: 'notes', label: 'Notebook' },
                  { id: 'safety', label: 'Safety' },
                ] as { id: SideTab; label: string }[]
              ).map((t) => (
                <button
                  key={t.id}
                  role="tab"
                  aria-selected={sideTab === t.id}
                  type="button"
                  onClick={() => setSideTab(t.id)}
                  className={`py-2 px-2 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                    sideTab === t.id
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div className="p-5 space-y-4">
            {sideTab === 'protocol' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>Technique Checklist</span>
                  <span className="font-mono tabular-nums text-slate-700 font-medium">
                    {completion.done} / {completion.total} verified
                  </span>
                </div>
                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      completion.done === completion.total ? 'bg-emerald-600' : 'bg-blue-600'
                    }`}
                    style={{ width: `${completion.pct}%` }}
                  />
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{meta.aim}</p>
                <ol className="space-y-2.5">
                  {meta.steps.map((step, idx) => {
                    const done = nb.completedSteps.includes(step.id);
                    return (
                      <li key={step.id}>
                        <button
                          type="button"
                          onClick={() => toggleStep(practicalId, step.id)}
                          className={`w-full text-left p-3 rounded-lg border transition-colors flex items-start gap-3 cursor-pointer ${
                            done
                              ? 'bg-emerald-50/50 border-emerald-200'
                              : 'bg-white border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          {done ? (
                            <CheckCircle2
                              className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5"
                              aria-hidden="true"
                            />
                          ) : (
                            <Circle
                              className="w-4 h-4 text-slate-300 shrink-0 mt-0.5"
                              aria-hidden="true"
                            />
                          )}
                          <div className="space-y-0.5">
                            <p
                              className={`text-xs font-semibold ${
                                done ? 'text-emerald-900' : 'text-slate-900'
                              }`}
                            >
                              {idx + 1}. {step.title}
                            </p>
                            <p className="text-xs text-slate-600 leading-relaxed">{step.detail}</p>
                          </div>
                        </button>
                      </li>
                    );
                  })}
                </ol>
              </div>
            )}

            {sideTab === 'data' && (
              <div className="space-y-4">
                {dataPanel ? (
                  dataPanel
                ) : (
                  <p className="text-xs text-slate-500">
                    Run trials on the workbench to record measurements here.
                  </p>
                )}
              </div>
            )}

            {sideTab === 'notes' && (
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor={`obs-${practicalId}`}
                    className="block text-xs font-semibold text-slate-800 mb-1.5"
                  >
                    Experimental Observations
                  </label>
                  <textarea
                    id={`obs-${practicalId}`}
                    rows={5}
                    value={nb.observations}
                    onChange={(e) => updateObservations(practicalId, e.target.value)}
                    placeholder="Record colour changes, effervescence, temperature changes, precipitates, or meniscus readings..."
                    className="w-full rounded-lg border border-slate-200 bg-slate-50/60 px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label
                    htmlFor={`conc-${practicalId}`}
                    className="block text-xs font-semibold text-slate-800 mb-1.5"
                  >
                    Conclusion &amp; Sources of Error
                  </label>
                  <textarea
                    id={`conc-${practicalId}`}
                    rows={5}
                    value={nb.conclusion}
                    onChange={(e) => updateConclusion(practicalId, e.target.value)}
                    placeholder="Explain your findings using particle theory / reactivity / quantitative calculations and note how accuracy could be improved..."
                    className="w-full rounded-lg border border-slate-200 bg-slate-50/60 px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-600 focus:outline-none"
                  />
                </div>
                <p className="text-xs text-slate-500">
                  Notes save automatically to your Lab Notebook and are included in CSV exports.
                </p>
              </div>
            )}

            {sideTab === 'safety' && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-semibold text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2.5">
                  <ShieldAlert className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <span>Eye protection (safety goggles) must be worn throughout this practical.</span>
                </div>
                <div className="divide-y divide-slate-100">
                  {meta.hazards.map((h) => (
                    <div key={h.substance} className="py-3 space-y-1">
                      <p className="text-xs font-semibold text-slate-900">{h.substance}</p>
                      <p className="text-xs text-rose-700">Hazard: {h.risk}</p>
                      <p className="text-xs text-slate-600">Control measure: {h.control}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
};
