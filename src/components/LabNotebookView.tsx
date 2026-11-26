import React, { useState } from 'react';
import { ArrowRight, Download, RotateCcw } from 'lucide-react';
import { PRACTICALS } from '../data/practicals';
import { PracticalId } from '../types/lab';
import { useLab } from '../context/LabContext';

interface LabNotebookViewProps {
  onOpenPractical: (id: PracticalId) => void;
}

export const LabNotebookView: React.FC<LabNotebookViewProps> = ({ onOpenPractical }) => {
  const { state, getPracticalCompletion, exportLabReportCsv, resetAllProgress } = useLab();
  const [confirmReset, setConfirmReset] = useState(false);

  return (
    <main className="max-w-[1200px] mx-auto px-6 py-10 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <p className="text-xs text-slate-500">Persistent Experimental Log · Saved Locally</p>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight mt-1">
            Student Lab Notebook
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Review recorded experimental data, calculations, observations, and protocol completion across all eight AQA required practicals.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={exportLabReportCsv}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" aria-hidden="true" />
            Download CSV Report
          </button>

          {!confirmReset ? (
            <button
              type="button"
              onClick={() => setConfirmReset(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
              Reset All
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  resetAllProgress();
                  setConfirmReset(false);
                }}
                className="px-3 py-2 text-xs font-medium text-white bg-rose-600 hover:bg-rose-700 rounded-lg whitespace-nowrap shrink-0 cursor-pointer"
              >
                Confirm Clear
              </button>
              <button
                type="button"
                onClick={() => setConfirmReset(false)}
                className="px-3 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 whitespace-nowrap shrink-0 cursor-pointer"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-6">
        {PRACTICALS.map((p) => {
          const nb = state.notebooks[p.id];
          const comp = getPracticalCompletion(p.id);
          return (
            <section
              key={p.id}
              className="bg-white border border-slate-200 rounded-xl p-6 space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <p className="text-xs font-mono text-slate-500">
                    Practical 0{p.number} · {p.aqaRef} · {comp.done}/{comp.total} steps verified
                    {nb.lastUpdated ? ` · Updated ${nb.lastUpdated}` : ''}
                  </p>
                  <h2 className="text-lg font-bold text-slate-900 mt-0.5">{p.title}</h2>
                </div>
                <button
                  type="button"
                  onClick={() => onOpenPractical(p.id)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors whitespace-nowrap shrink-0 self-start sm:self-center cursor-pointer"
                >
                  Open Workbench
                  <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
              </div>

              {/* Practical-specific structured data snapshot */}
              {p.id === 'p1-salts' && state.saltTrial && (
                <div className="text-xs font-mono tabular-nums text-slate-700 bg-slate-50 border border-slate-200 rounded-lg p-3 grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <span className="text-slate-500 block">H₂SO₄ Volume</span>
                    {state.saltTrial.acidVolumeCm3} cm³
                  </div>
                  <div>
                    <span className="text-slate-500 block">Warming Temp</span>
                    {state.saltTrial.warmedTempC} °C
                  </div>
                  <div>
                    <span className="text-slate-500 block">CuO Added</span>
                    {state.saltTrial.cuoSpatulas} spatulas (excess)
                  </div>
                  <div>
                    <span className="text-slate-500 block">Dry Crystal Yield</span>
                    {state.saltTrial.dryYieldG.toFixed(2)} g
                  </div>
                </div>
              )}

              {p.id === 'p2-titration' && state.titrationRuns.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-500">
                        <th className="py-2 pr-4 font-medium">Run</th>
                        <th className="py-2 pr-4 font-medium">Indicator</th>
                        <th className="py-2 pr-4 font-medium text-right">Initial (cm³)</th>
                        <th className="py-2 pr-4 font-medium text-right">Final (cm³)</th>
                        <th className="py-2 font-medium text-right">Titre (cm³)</th>
                      </tr>
                    </thead>
                    <tbody className="font-mono tabular-nums divide-y divide-slate-100">
                      {state.titrationRuns.map((run) => (
                        <tr key={run.id}>
                          <td className="py-1.5 pr-4 font-sans text-slate-800">{run.label}</td>
                          <td className="py-1.5 pr-4 font-sans text-slate-600">{run.indicator}</td>
                          <td className="py-1.5 pr-4 text-right">{run.initialCm3.toFixed(2)}</td>
                          <td className="py-1.5 pr-4 text-right">{run.finalCm3.toFixed(2)}</td>
                          <td className="py-1.5 text-right font-semibold text-slate-900">
                            {run.titreCm3.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {p.id === 'p3-electrolysis' && state.electrolysisRecords.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-500">
                        <th className="py-2 pr-4 font-medium">Solution</th>
                        <th className="py-2 pr-4 font-medium">Cathode (−) Product</th>
                        <th className="py-2 pr-4 font-medium">Anode (+) Product</th>
                        <th className="py-2 font-medium">Gas Test</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {state.electrolysisRecords.map((r) => (
                        <tr key={r.solutionId}>
                          <td className="py-1.5 pr-4 font-medium text-slate-800">{r.solutionName}</td>
                          <td className="py-1.5 pr-4 text-slate-700">{r.cathodeProduct}</td>
                          <td className="py-1.5 pr-4 text-slate-700">{r.anodeProduct}</td>
                          <td className="py-1.5 text-slate-600">{r.gasTestUsed}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {p.id === 'p4-temp-changes' && state.tempReadings.length > 0 && (
                <p className="text-xs font-mono tabular-nums text-slate-700 bg-slate-50 border border-slate-200 rounded-lg p-3">
                  {state.tempReadings.length} calorimetry readings logged — Range:{' '}
                  {Math.min(...state.tempReadings.map((r) => r.tempC)).toFixed(1)} °C to{' '}
                  {Math.max(...state.tempReadings.map((r) => r.tempC)).toFixed(1)} °C
                </p>
              )}

              {p.id === 'p5-rates' &&
                (state.turbidityReadings.length > 0 || state.gasSyringeSeries.length > 0) && (
                  <p className="text-xs font-mono tabular-nums text-slate-700 bg-slate-50 border border-slate-200 rounded-lg p-3">
                    Disappearing cross trials: {state.turbidityReadings.length} · Gas syringe curves:{' '}
                    {state.gasSyringeSeries.length}
                  </p>
                )}

              {p.id === 'p6-chromatography' && state.chromatographyRecords.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-500">
                        <th className="py-2 pr-4 font-medium">Sample</th>
                        <th className="py-2 pr-4 font-medium text-right">Spot (mm)</th>
                        <th className="py-2 pr-4 font-medium text-right">Solvent Front (mm)</th>
                        <th className="py-2 font-medium text-right">Rf Value</th>
                      </tr>
                    </thead>
                    <tbody className="font-mono tabular-nums divide-y divide-slate-100">
                      {state.chromatographyRecords.map((r) => (
                        <tr key={r.sampleId}>
                          <td className="py-1.5 pr-4 font-sans text-slate-800">{r.sampleLabel}</td>
                          <td className="py-1.5 pr-4 text-right">{r.spotDistanceMm.toFixed(1)}</td>
                          <td className="py-1.5 pr-4 text-right">{r.solventFrontMm.toFixed(1)}</td>
                          <td className="py-1.5 text-right font-semibold">{r.rfValue.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {p.id === 'p7-ions' && state.ionRecords.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-500">
                        <th className="py-2 pr-4 font-medium">Sample</th>
                        <th className="py-2 pr-4 font-medium">Flame</th>
                        <th className="py-2 pr-4 font-medium">NaOH</th>
                        <th className="py-2 pr-4 font-medium">Anion</th>
                        <th className="py-2 font-medium">Identification</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {state.ionRecords.map((r) => (
                        <tr key={r.sampleId}>
                          <td className="py-1.5 pr-4 font-medium text-slate-800">{r.sampleLabel}</td>
                          <td className="py-1.5 pr-4 text-slate-600">{r.flameResult || '—'}</td>
                          <td className="py-1.5 pr-4 text-slate-600">{r.naohResult || '—'}</td>
                          <td className="py-1.5 pr-4 text-slate-600">{r.anionResult || '—'}</td>
                          <td className="py-1.5 font-medium text-slate-900">
                            {r.studentIdentification || 'Pending'}
                            {r.verified ? ' (Verified)' : ''}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {p.id === 'p8-water' && (state.waterRecords.length > 0 || state.distillationCompleted) && (
                <p className="text-xs font-mono tabular-nums text-slate-700 bg-slate-50 border border-slate-200 rounded-lg p-3">
                  Samples analysed: {state.waterRecords.length}/4 · Simple distillation:{' '}
                  {state.distillationCompleted
                    ? `Complete (Distillate pH ${state.distillatePh?.toFixed(1) ?? '7.0'}, BP ${state.distillateBpC?.toFixed(1) ?? '100.0'} °C)`
                    : 'Not yet run'}
                </p>
              )}

              {/* Written Notes */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm pt-1">
                <div>
                  <p className="text-xs font-medium text-slate-500 mb-1">Recorded Observations</p>
                  <p className="text-slate-700 whitespace-pre-wrap">
                    {nb.observations.trim() || 'No written observations recorded yet.'}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500 mb-1">Conclusion &amp; Evaluation</p>
                  <p className="text-slate-700 whitespace-pre-wrap">
                    {nb.conclusion.trim() || 'No conclusion written yet.'}
                  </p>
                </div>
              </div>
            </section>
          );
        })}
      </div>
    </main>
  );
};
