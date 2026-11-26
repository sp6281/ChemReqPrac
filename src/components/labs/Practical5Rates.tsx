import React, { useEffect, useState } from 'react';
import { Play, Square, RotateCcw, Check } from 'lucide-react';
import { WorkbenchShell } from '../WorkbenchShell';
import { PracticalId } from '../../types/lab';
import { useLab } from '../../context/LabContext';

interface Props {
  onSelectPractical: (id: PracticalId) => void;
  onBackToDirectory: () => void;
}

const THIO_CONCS = [8, 16, 24, 32, 40]; // g/dm³
const HCL_CONCS = [0.5, 1.0, 1.5, 2.0]; // mol/dm³

// Realistic disappearance time (in seconds, accelerated 2.5x visually for classroom interactivity while displaying true physical seconds)
function targetDisappearSeconds(concGdm3: number): number {
  // Rate 1/t proportional to conc -> t ≈ 720 / conc
  return +(720 / concGdm3).toFixed(1);
}

// Gas syringe kinetic curve V(t) = Vmax * (1 - exp(-k*c*t))
function gasVolumeAt(timeS: number, concMol: number): number {
  const vmax = 60.0;
  const k = 0.042;
  return +(vmax * (1 - Math.exp(-k * concMol * timeS))).toFixed(1);
}

export const Practical5Rates: React.FC<Props> = ({
  onSelectPractical,
  onBackToDirectory,
}) => {
  const {
    state,
    addTurbidityReading,
    clearTurbidityReadings,
    upsertGasSyringeSeries,
    clearGasSyringeSeries,
    completeStep,
  } = useLab();

  const [method, setMethod] = useState<'cross' | 'syringe'>('cross');

  // Method A: Disappearing Cross state
  const [thioConc, setThioConc] = useState<number>(24);
  const [crossRunning, setCrossRunning] = useState(false);
  const [crossTimeS, setCrossTimeS] = useState(0);
  const [crossFeedback, setCrossFeedback] = useState(
    'Select a sodium thiosulfate concentration (8–40 g/dm³), add HCl to start the stopwatch, and press Stop the instant the black cross disappears.'
  );

  // Method B: Gas Syringe state
  const [hclConc, setHclConc] = useState<number>(1.0);
  const [syringeRunning, setSyringeRunning] = useState(false);
  const [syringeTimeS, setSyringeTimeS] = useState(0);
  const [currentSeriesPts, setCurrentSeriesPts] = useState<{ timeS: number; volumeCm3: number }[]>([]);
  const [syringeFeedback, setSyringeFeedback] = useState(
    'Choose an HCl concentration (0.5–2.0 mol/dm³), drop in the 3 cm magnesium ribbon, and collect H₂ gas readings up to 60 s.'
  );

  // Method A timer (runs at 2.5x real speed so students can complete multiple concentrations swiftly while clock shows real physical seconds)
  useEffect(() => {
    if (!crossRunning) return;
    const interval = window.setInterval(() => {
      setCrossTimeS((prev) => +(prev + 0.5).toFixed(1));
    }, 200);
    return () => window.clearInterval(interval);
  }, [crossRunning]);

  // Method B gas syringe timer (collects every 10 s up to 60 s)
  useEffect(() => {
    if (!syringeRunning) return;
    const interval = window.setInterval(() => {
      setSyringeTimeS((prev) => {
        const next = prev + 2;
        if (next % 10 === 0 && next <= 60) {
          const vol = gasVolumeAt(next, hclConc);
          setCurrentSeriesPts((pts) => {
            if (pts.some((p) => p.timeS === next)) return pts;
            return [...pts, { timeS: next, volumeCm3: vol }];
          });
        }
        if (next >= 60) {
          setSyringeRunning(false);
          const fullPts = [0, 10, 20, 30, 40, 50, 60].map((t) => ({
            timeS: t,
            volumeCm3: gasVolumeAt(t, hclConc),
          }));
          setCurrentSeriesPts(fullPts);
          upsertGasSyringeSeries({ concentrationMol: hclConc, points: fullPts });
          completeStep('p5-rates', 'syringe-trial');
          const totalSeries = new Set([
            ...state.gasSyringeSeries.map((s) => s.concentrationMol),
            hclConc,
          ]).size;
          if (totalSeries >= 2) {
            completeStep('p5-rates', 'compare-curves');
          }
          setSyringeFeedback(
            `60 s collection complete for ${hclConc.toFixed(1)} mol/dm³ HCl (final volume ${gasVolumeAt(
              60,
              hclConc
            ).toFixed(1)} cm³). Curve saved—test another concentration to compare initial gradients.`
          );
          return 60;
        }
        return next;
      });
    }, 180);
    return () => window.clearInterval(interval);
  }, [syringeRunning, hclConc, upsertGasSyringeSeries, completeStep, state.gasSyringeSeries]);

  const expectedCrossT = targetDisappearSeconds(thioConc);
  const turbidityRatio = Math.min(1, crossTimeS / expectedCrossT);

  const handleStartCross = () => {
    setCrossTimeS(0);
    setCrossRunning(true);
    setCrossFeedback(
      `Mixed 50 cm³ of ${thioConc} g/dm³ Na₂S₂O₃ with 10 cm³ HCl. Watch the yellow sulfur precipitate cloud the flask and click Stop when the cross vanishes.`
    );
  };

  const handleStopCross = () => {
    setCrossRunning(false);
    if (crossTimeS < expectedCrossT * 0.72) {
      setCrossFeedback(
        `Stopped early at ${crossTimeS.toFixed(
          1
        )} s — the cross is still clearly visible! Wait until the sulfur precipitate completely obscures the cross.`
      );
      return;
    }
    const rate = +(1 / crossTimeS).toFixed(4);
    addTurbidityReading({
      concentrationGdm3: thioConc,
      timeS: crossTimeS,
      ratePerS: rate,
    });
    completeStep('p5-rates', 'cross-first-run');
    const uniqueConcs = new Set([
      ...state.turbidityReadings.map((r) => r.concentrationGdm3),
      thioConc,
    ]).size;
    if (uniqueConcs >= 3) {
      completeStep('p5-rates', 'cross-multiple');
    }
    setCrossFeedback(
      `Recorded ${thioConc} g/dm³ → ${crossTimeS.toFixed(1)} s (Rate 1/t = ${rate.toFixed(
        4
      )} s⁻¹). Test at least 3 concentrations to observe the linear rate relationship.`
    );
  };

  const handleStartSyringe = () => {
    setSyringeTimeS(0);
    setCurrentSeriesPts([{ timeS: 0, volumeCm3: 0 }]);
    setSyringeRunning(true);
    setSyringeFeedback(
      `Magnesium ribbon added to ${hclConc.toFixed(
        1
      )} mol/dm³ HCl and bung fitted. Collecting H₂ gas volume every 10 seconds...`
    );
  };

  const resetLocal = () => {
    setCrossRunning(false);
    setCrossTimeS(0);
    setSyringeRunning(false);
    setSyringeTimeS(0);
    setCurrentSeriesPts([]);
  };

  const liveSyringeVol = gasVolumeAt(syringeTimeS, hclConc);
  const curveColors: Record<number, string> = {
    0.5: '#64748b',
    1.0: '#0284c7',
    1.5: '#2563eb',
    2.0: '#dc2626',
  };

  const dataPanel = (
    <div className="space-y-4">
      {method === 'cross' ? (
        <>
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold text-slate-900">Disappearing Cross Table</h3>
            {state.turbidityReadings.length > 0 && (
              <button
                type="button"
                onClick={clearTurbidityReadings}
                className="text-xs text-slate-500 hover:text-rose-600 cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>
          {state.turbidityReadings.length === 0 ? (
            <p className="text-xs text-slate-500">
              Run trials across multiple Na₂S₂O₃ concentrations to populate time and rate (1/t).
            </p>
          ) : (
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500">
                  <th className="py-1.5 pr-2 font-medium">Conc (g/dm³)</th>
                  <th className="py-1.5 pr-2 font-medium text-right">Time (s)</th>
                  <th className="py-1.5 font-medium text-right">Rate 1/t (s⁻¹)</th>
                </tr>
              </thead>
              <tbody className="font-mono tabular-nums divide-y divide-slate-100">
                {state.turbidityReadings.map((r) => (
                  <tr key={r.concentrationGdm3}>
                    <td className="py-1.5 pr-2">{r.concentrationGdm3}</td>
                    <td className="py-1.5 pr-2 text-right">{r.timeS.toFixed(1)}</td>
                    <td className="py-1.5 text-right font-semibold text-blue-700">
                      {r.ratePerS.toFixed(4)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold text-slate-900">Gas Syringe Curves Logged</h3>
            {state.gasSyringeSeries.length > 0 && (
              <button
                type="button"
                onClick={clearGasSyringeSeries}
                className="text-xs text-slate-500 hover:text-rose-600 cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>
          {state.gasSyringeSeries.length === 0 ? (
            <p className="text-xs text-slate-500">
              Start a gas syringe run to record H₂ volume every 10 seconds up to 60 s.
            </p>
          ) : (
            <div className="space-y-2.5">
              {state.gasSyringeSeries.map((s) => (
                <div
                  key={s.concentrationMol}
                  className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                >
                  <p className="font-semibold text-slate-900 font-mono">
                    {s.concentrationMol.toFixed(1)} mol/dm³ HCl
                  </p>
                  <p className="font-mono tabular-nums text-slate-600 mt-1">
                    {s.points.map((p) => `${p.timeS}s:${p.volumeCm3.toFixed(0)}`).join(' · ')} cm³
                  </p>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );

  return (
    <WorkbenchShell
      practicalId="p5-rates"
      onSelectPractical={onSelectPractical}
      onBackToDirectory={onBackToDirectory}
      dataPanel={dataPanel}
      onResetLocal={resetLocal}
    >
      {/* Method Toggle Header */}
      <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1 p-1 bg-slate-200/70 rounded-lg">
          <button
            type="button"
            onClick={() => setMethod('cross')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
              method === 'cross'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Method A: Disappearing Cross (Turbidity)
          </button>
          <button
            type="button"
            onClick={() => setMethod('syringe')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
              method === 'syringe'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Method B: Gas Syringe (H₂ Volume)
          </button>
        </div>

        <div className="text-xs font-mono tabular-nums text-slate-700">
          {method === 'cross'
            ? `Stopwatch: ${crossTimeS.toFixed(1)} s`
            : `Elapsed: ${syringeTimeS} s · Volume: ${liveSyringeVol.toFixed(1)} cm³`}
        </div>
      </div>

      {method === 'cross' ? (
        <div className="p-6 bg-gradient-to-b from-slate-50/70 to-white space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Top-down view looking through conical flask at black X */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col items-center justify-center">
              <p className="text-xs text-slate-500 mb-2">Top-Down View Through Conical Flask</p>
              <svg
                viewBox="0 0 240 240"
                className="w-56 h-56"
                role="img"
                aria-label="Top-down view of sodium thiosulfate disappearing cross flask"
              >
                {/* White paper square with black cross */}
                <rect x="20" y="20" width="200" height="200" rx="6" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1.5" />
                <line x1="75" y1="75" x2="165" y2="165" stroke="#0f172a" strokeWidth="9" strokeLinecap="round" />
                <line x1="165" y1="75" x2="75" y2="165" stroke="#0f172a" strokeWidth="9" strokeLinecap="round" />

                {/* Conical flask base with growing cloudy sulfur precipitate */}
                <circle
                  cx="120"
                  cy="120"
                  r="82"
                  fill={`rgba(250, 240, 175, ${Math.min(0.985, Math.pow(turbidityRatio, 1.45))})`}
                  stroke="#64748b"
                  strokeWidth="2.5"
                />
                {/* Flask neck rim */}
                <circle cx="120" cy="120" r="28" fill="none" stroke="#94a3b8" strokeWidth="2" />
              </svg>
              <p className="text-xs font-mono tabular-nums text-slate-700 mt-1">
                {thioConc} g/dm³ Na₂S₂O₃ · t = {crossTimeS.toFixed(1)} s
              </p>
            </div>

            {/* Live Rate (1/t) vs Concentration Graph */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col justify-between">
              <p className="text-xs font-semibold text-slate-900">Rate (1/t) vs Concentration</p>
              <svg viewBox="0 0 290 210" className="w-full h-[215px]">
                {[0, 10, 20, 30, 40].map((c) => {
                  const x = 44 + (c / 45) * 230;
                  return (
                    <g key={c}>
                      <line x1={x} y1={24} x2={x} y2={168} stroke="#e2e8f0" />
                      <text x={x} y={182} textAnchor="middle" fontSize="9" fill="#64748b" fontFamily="IBM Plex Mono">
                        {c}
                      </text>
                    </g>
                  );
                })}
                {[0, 0.02, 0.04, 0.06].map((r) => {
                  const y = 168 - (r / 0.065) * 144;
                  return (
                    <g key={r}>
                      <line x1={44} y1={y} x2={274} y2={y} stroke="#e2e8f0" />
                      <text x={39} y={y + 3} textAnchor="end" fontSize="8.5" fill="#64748b" fontFamily="IBM Plex Mono">
                        {r.toFixed(2)}
                      </text>
                    </g>
                  );
                })}
                <line x1="44" y1="24" x2="44" y2="168" stroke="#475569" strokeWidth="1.5" />
                <line x1="44" y1="168" x2="274" y2="168" stroke="#475569" strokeWidth="1.5" />
                <text x="159" y="198" textAnchor="middle" fontSize="9.5" fill="#475569">
                  Concentration of Na₂S₂O₃ (g/dm³)
                </text>
                {state.turbidityReadings.length >= 2 && (
                  <polyline
                    fill="none"
                    stroke="#2563eb"
                    strokeWidth="2"
                    points={state.turbidityReadings
                      .map((r) => `${44 + (r.concentrationGdm3 / 45) * 230},${168 - (r.ratePerS / 0.065) * 144}`)
                      .join(' ')}
                  />
                )}
                {state.turbidityReadings.map((r) => (
                  <circle
                    key={r.concentrationGdm3}
                    cx={44 + (r.concentrationGdm3 / 45) * 230}
                    cy={168 - (r.ratePerS / 0.065) * 144}
                    r="4"
                    fill="#1d4ed8"
                  />
                ))}
              </svg>
            </div>
          </div>

          <div className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700">
            <span className="font-semibold text-slate-900 mr-1.5">Trial status:</span>
            {crossFeedback}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
              {THIO_CONCS.map((c) => (
                <button
                  key={c}
                  type="button"
                  disabled={crossRunning}
                  onClick={() => {
                    setThioConc(c);
                    setCrossTimeS(0);
                  }}
                  className={`px-2.5 py-1.5 text-xs font-mono rounded-md transition-colors cursor-pointer disabled:opacity-50 ${
                    thioConc === c ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  {c} g/dm³
                </button>
              ))}
            </div>

            {!crossRunning ? (
              <button
                type="button"
                onClick={handleStartCross}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-blue-700 hover:bg-blue-800 rounded-lg cursor-pointer whitespace-nowrap"
              >
                <Play className="w-3.5 h-3.5" aria-hidden="true" />
                Add HCl &amp; Start Timer
              </button>
            ) : (
              <button
                type="button"
                onClick={handleStopCross}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-rose-600 hover:bg-rose-700 rounded-lg cursor-pointer whitespace-nowrap"
              >
                <Square className="w-3.5 h-3.5" aria-hidden="true" />
                Stop — Cross Disappeared
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                setCrossRunning(false);
                setCrossTimeS(0);
              }}
              className="inline-flex items-center gap-1 px-3 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer whitespace-nowrap"
            >
              <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
              Rinse Flask
            </button>
          </div>
        </div>
      ) : (
        <div className="p-6 bg-gradient-to-b from-slate-50/70 to-white space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Gas Syringe Apparatus SVG */}
            <div className="bg-white border border-slate-200 rounded-xl p-4">
              <svg viewBox="0 0 340 230" className="w-full h-[220px]" role="img" aria-label="Gas syringe collecting hydrogen from magnesium and HCl">
                <rect x="0" y="200" width="340" height="30" fill="#f1f5f9" />
                {/* Conical flask with Mg + HCl */}
                <path
                  d="M74 96 L74 114 L42 194 Q40 200 47 200 L121 200 Q128 200 126 194 L94 114 L94 96"
                  fill="#ffffff"
                  stroke="#64748b"
                  strokeWidth="2"
                />
                <path d="M52 166 L116 166 L125 194 Q126 198 120 198 L48 198 Q42 198 43 194 Z" fill="#e0f2fe" />
                {/* Magnesium ribbon */}
                <rect x="74" y="190" width="20" height="4" rx="1" fill="#475569" />
                {syringeRunning && (
                  <g fill="#ffffff" stroke="#0284c7" strokeWidth="1">
                    <circle cx="78" cy="182" r="3" className="animate-bubble" />
                    <circle cx="88" cy="176" r="3.5" className="animate-bubble" style={{ animationDelay: '0.35s' }} />
                    <circle cx="82" cy="170" r="2.5" className="animate-bubble" style={{ animationDelay: '0.7s' }} />
                  </g>
                )}
                {/* Rubber bung & delivery tube */}
                <rect x="72" y="86" width="24" height="12" rx="2" fill="#334155" />
                <path d="M84 86 L84 58 L168 58 L168 92" fill="none" stroke="#475569" strokeWidth="3" />

                {/* 100 cm3 Gas Syringe Barrel */}
                <rect x="168" y="76" width="144" height="32" rx="3" fill="#ffffff" stroke="#64748b" strokeWidth="2" />
                {/* Gas filled space */}
                <rect
                  x="170"
                  y="78"
                  width={Math.min(110, (liveSyringeVol / 70) * 110)}
                  height="28"
                  fill="#dbeafe"
                  opacity="0.7"
                />
                {/* Moving Plunger */}
                <rect
                  x={170 + Math.min(110, (liveSyringeVol / 70) * 110)}
                  y="79"
                  width="12"
                  height="26"
                  fill="#475569"
                />
                <rect
                  x={182 + Math.min(110, (liveSyringeVol / 70) * 110)}
                  y="89"
                  width="46"
                  height="6"
                  fill="#64748b"
                />
                <text x="240" y="132" textAnchor="middle" fontSize="13" fontWeight="600" fill="#0f172a" fontFamily="IBM Plex Mono">
                  {liveSyringeVol.toFixed(1)} cm³ H₂
                </text>
                <text x="240" y="150" textAnchor="middle" fontSize="10.5" fill="#64748b" fontFamily="DM Sans">
                  {hclConc.toFixed(1)} mol/dm³ HCl · t = {syringeTimeS} s
                </text>
              </svg>
            </div>

            {/* Volume vs Time Curves SVG */}
            <div className="bg-white border border-slate-200 rounded-xl p-4">
              <p className="text-xs font-semibold text-slate-900 mb-1">Volume of H₂ (cm³) vs Time (s)</p>
              <svg viewBox="0 0 290 210" className="w-full h-[205px]">
                {[0, 20, 40, 60].map((t) => {
                  const x = 42 + (t / 60) * 232;
                  return (
                    <g key={t}>
                      <line x1={x} y1={20} x2={x} y2={168} stroke="#e2e8f0" />
                      <text x={x} y={182} textAnchor="middle" fontSize="9" fill="#64748b" fontFamily="IBM Plex Mono">
                        {t}
                      </text>
                    </g>
                  );
                })}
                {[0, 20, 40, 60].map((v) => {
                  const y = 168 - (v / 65) * 148;
                  return (
                    <g key={v}>
                      <line x1={42} y1={y} x2={274} y2={y} stroke="#e2e8f0" />
                      <text x={36} y={y + 3} textAnchor="end" fontSize="9" fill="#64748b" fontFamily="IBM Plex Mono">
                        {v}
                      </text>
                    </g>
                  );
                })}
                <line x1="42" y1="20" x2="42" y2="168" stroke="#475569" strokeWidth="1.5" />
                <line x1="42" y1="168" x2="274" y2="168" stroke="#475569" strokeWidth="1.5" />

                {state.gasSyringeSeries.map((series) => (
                  <polyline
                    key={series.concentrationMol}
                    fill="none"
                    stroke={curveColors[series.concentrationMol] ?? '#2563eb'}
                    strokeWidth="2"
                    points={series.points
                      .map((p) => `${42 + (p.timeS / 60) * 232},${168 - (p.volumeCm3 / 65) * 148}`)
                      .join(' ')}
                  />
                ))}

                {syringeRunning && currentSeriesPts.length > 1 && (
                  <polyline
                    fill="none"
                    stroke={curveColors[hclConc] ?? '#2563eb'}
                    strokeWidth="2"
                    strokeDasharray="4 2"
                    points={currentSeriesPts
                      .map((p) => `${42 + (p.timeS / 60) * 232},${168 - (p.volumeCm3 / 65) * 148}`)
                      .join(' ')}
                  />
                )}
              </svg>
            </div>
          </div>

          <div className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700">
            <span className="font-semibold text-slate-900 mr-1.5">Gas collection:</span>
            {syringeFeedback}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
              {HCL_CONCS.map((c) => (
                <button
                  key={c}
                  type="button"
                  disabled={syringeRunning}
                  onClick={() => {
                    setHclConc(c);
                    setSyringeTimeS(0);
                  }}
                  className={`px-2.5 py-1.5 text-xs font-mono rounded-md transition-colors cursor-pointer disabled:opacity-50 ${
                    hclConc === c ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  {c.toFixed(1)} M HCl
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={handleStartSyringe}
              disabled={syringeRunning}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-blue-700 hover:bg-blue-800 rounded-lg cursor-pointer disabled:opacity-50 whitespace-nowrap"
            >
              <Check className="w-3.5 h-3.5" aria-hidden="true" />
              {syringeRunning ? `Collecting (${syringeTimeS}s / 60s)...` : 'Drop Mg Ribbon & Collect Gas'}
            </button>
          </div>
        </div>
      )}
    </WorkbenchShell>
  );
};
