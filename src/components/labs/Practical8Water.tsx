import React, { useEffect, useState } from 'react';
import { Flame, Scale, Droplets, Check } from 'lucide-react';
import { WorkbenchShell } from '../WorkbenchShell';
import { PracticalId } from '../../types/lab';
import { useLab } from '../../context/LabContext';

interface Props {
  onSelectPractical: (id: PracticalId) => void;
  onBackToDirectory: () => void;
}

interface WaterSampleSpec {
  id: string;
  name: string;
  ph: number;
  uiColor: string;
  emptyBasinG: number;
  dissolvedSolidsG: number;
  note: string;
}

const WATER_SAMPLES: WaterSampleSpec[] = [
  {
    id: 'tap',
    name: 'Tap Water',
    ph: 7.2,
    uiColor: '#22c55e',
    emptyBasinG: 42.15,
    dissolvedSolidsG: 0.04,
    note: 'Neutral pH with trace dissolved mineral ions (potable, not chemically pure).',
  },
  {
    id: 'sea',
    name: 'Sea Water',
    ph: 8.1,
    uiColor: '#0d9488',
    emptyBasinG: 42.15,
    dissolvedSolidsG: 0.88,
    note: 'Slightly alkaline with high mass of dissolved sodium chloride crystals left behind.',
  },
  {
    id: 'river',
    name: 'River Water',
    ph: 6.5,
    uiColor: '#84cc16',
    emptyBasinG: 42.15,
    dissolvedSolidsG: 0.14,
    note: 'Slightly acidic from dissolved humic/carbonic acids with moderate dissolved solids.',
  },
  {
    id: 'rain',
    name: 'Rainwater',
    ph: 5.8,
    uiColor: '#eab308',
    emptyBasinG: 42.15,
    dissolvedSolidsG: 0.01,
    note: 'Weakly acidic due to dissolved atmospheric CO₂; almost zero dissolved mineral solids.',
  },
];

export const Practical8Water: React.FC<Props> = ({
  onSelectPractical,
  onBackToDirectory,
}) => {
  const { state, upsertWaterRecord, setDistillationResult, completeStep } = useLab();

  const [part, setPart] = useState<'analysis' | 'distillation'>('analysis');

  // Part 1: Analysis state
  const [sampleId, setSampleId] = useState<string>('sea');
  const [phTested, setPhTested] = useState(false);
  const [basinWeighed, setBasinWeighed] = useState(false);
  const [evaporated, setEvaporated] = useState(false);
  const [finalWeighed, setFinalWeighed] = useState(false);

  // Part 2: Simple Distillation state
  const [granulesAdded, setGranulesAdded] = useState(false);
  const [distilling, setDistilling] = useState(false);
  const [vapourTemp, setVapourTemp] = useState(21.0);
  const [distillateProgress, setDistillateProgress] = useState(0);
  const [purityVerified, setPurityVerified] = useState(false);

  const [feedback, setFeedback] = useState(
    'Part 1: Select a water sample, test its pH with universal indicator paper, then weigh and evaporate 25 cm³ to measure dissolved solids.'
  );

  const sample = WATER_SAMPLES.find((s) => s.id === sampleId) ?? WATER_SAMPLES[1];

  // Simple distillation heating & condensation loop
  useEffect(() => {
    if (!distilling) return;
    const timer = window.setInterval(() => {
      setVapourTemp((t) => {
        const nextT = Math.min(100.0, +(t + 8.5).toFixed(1));
        if (nextT >= 100.0) {
          setDistillateProgress((p) => {
            const nextP = Math.min(100, p + 10);
            if (nextP >= 100) {
              setDistilling(false);
              setFeedback(
                'Pure distilled water condensed steadily at 100.0 °C in the ice-cooled collection tube! Click "Verify Distillate Purity" to check pH and boiling point.'
              );
            }
            return nextP;
          });
        }
        return nextT;
      });
    }, 260);
    return () => window.clearInterval(timer);
  }, [distilling]);

  const handleSelectSample = (id: string) => {
    setSampleId(id);
    setPhTested(false);
    setBasinWeighed(false);
    setEvaporated(false);
    setFinalWeighed(false);
    const s = WATER_SAMPLES.find((x) => x.id === id)!;
    setFeedback(`Loaded ${s.name}. Measure its pH and dissolved solids mass.`);
  };

  const handleTestPh = () => {
    setPhTested(true);
    completeStep('p8-water', 'test-ph');
    const existing = state.waterRecords.find((r) => r.sampleId === sample.id);
    upsertWaterRecord({
      sampleId: sample.id,
      sampleName: sample.name,
      ph: sample.ph,
      emptyBasinG: existing?.emptyBasinG ?? null,
      finalBasinG: existing?.finalBasinG ?? null,
      dissolvedSolidsG: existing?.dissolvedSolidsG ?? null,
    });
    setFeedback(`Universal indicator reading for ${sample.name}: pH ${sample.ph.toFixed(1)}.`);
  };

  const handleWeighEmpty = () => {
    setBasinWeighed(true);
    setFeedback(
      `Clean dry evaporating basin weighed on digital balance: ${sample.emptyBasinG.toFixed(
        2
      )} g. Now pour 25 cm³ of ${sample.name} and evaporate to dryness.`
    );
  };

  const handleEvaporate = () => {
    if (!basinWeighed) {
      setFeedback('Weigh the empty evaporating basin before adding and evaporating water.');
      return;
    }
    setEvaporated(true);
    setFeedback(
      `25 cm³ of ${sample.name} evaporated to dryness and cooled on a heatproof mat. Re-weigh the basin on the digital balance.`
    );
  };

  const handleFinalWeigh = () => {
    if (!evaporated) {
      setFeedback('Evaporate the 25 cm³ water sample to dryness before taking the final mass.');
      return;
    }
    setFinalWeighed(true);
    completeStep('p8-water', 'measure-dissolved-solids');
    const finalG = +(sample.emptyBasinG + sample.dissolvedSolidsG).toFixed(2);
    upsertWaterRecord({
      sampleId: sample.id,
      sampleName: sample.name,
      ph: phTested ? sample.ph : state.waterRecords.find((r) => r.sampleId === sample.id)?.ph ?? null,
      emptyBasinG: sample.emptyBasinG,
      finalBasinG: finalG,
      dissolvedSolidsG: sample.dissolvedSolidsG,
    });
    setFeedback(
      `Final mass = ${finalG.toFixed(2)} g. Mass of dissolved solids = ${sample.dissolvedSolidsG.toFixed(
        2
      )} g per 25 cm³. ${sample.note}`
    );
  };

  const handleAddGranules = () => {
    setGranulesAdded(true);
    completeStep('p8-water', 'setup-distillation');
    setFeedback(
      'Anti-bumping granules added to the sea water flask to ensure smooth boiling. Switch on the Bunsen burner to begin simple distillation.'
    );
  };

  const handleStartDistil = () => {
    if (!granulesAdded) {
      setFeedback(
        'Safety reminder: Always add anti-bumping granules to the conical flask before heating to prevent violent boiling.'
      );
      return;
    }
    setDistillateProgress(0);
    setVapourTemp(21.0);
    setDistilling(true);
    setFeedback('Heating sea water gently. Steam rises past the thermometer bulb at 100.0 °C and condenses in the ice-water bath.');
  };

  const handleVerifyDistillate = () => {
    setPurityVerified(true);
    setDistillationResult(true, 7.0, 100.0);
    completeStep('p8-water', 'distil-and-verify');
    setFeedback(
      'Distillate verified: pH = 7.0 (neutral green), boiling point = 100.0 °C, and 0.00 g dissolved solids upon evaporation. Chemically pure water confirmed!'
    );
  };

  const resetLocal = () => {
    setPhTested(false);
    setBasinWeighed(false);
    setEvaporated(false);
    setFinalWeighed(false);
    setGranulesAdded(false);
    setDistilling(false);
    setVapourTemp(21.0);
    setDistillateProgress(0);
    setPurityVerified(false);
  };

  const displayedBalanceG = finalWeighed
    ? (sample.emptyBasinG + sample.dissolvedSolidsG).toFixed(2)
    : basinWeighed
    ? sample.emptyBasinG.toFixed(2)
    : '0.00';

  const dataPanel = (
    <div className="space-y-4">
      <h3 className="text-xs font-semibold text-slate-900">Water Analysis Results</h3>
      {state.waterRecords.length === 0 ? (
        <p className="text-xs text-slate-500">
          Test the pH and dissolved solids mass for Tap, Sea, River, and Rainwater samples.
        </p>
      ) : (
        <table className="w-full text-xs text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 text-slate-500">
              <th className="py-1.5 pr-2 font-medium">Sample</th>
              <th className="py-1.5 pr-2 font-medium text-right">pH</th>
              <th className="py-1.5 font-medium text-right">Solids (g)</th>
            </tr>
          </thead>
          <tbody className="font-mono tabular-nums divide-y divide-slate-100">
            {state.waterRecords.map((r) => (
              <tr key={r.sampleId}>
                <td className="py-1.5 pr-2 font-sans text-slate-800">{r.sampleName}</td>
                <td className="py-1.5 pr-2 text-right">{r.ph !== null ? r.ph.toFixed(1) : '—'}</td>
                <td className="py-1.5 text-right font-semibold text-slate-900">
                  {r.dissolvedSolidsG !== null ? r.dissolvedSolidsG.toFixed(2) : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1">
        <p className="font-semibold text-slate-900">Simple Distillation Verification</p>
        <p className="text-slate-600">
          {state.distillationCompleted
            ? `Distillate pH: ${state.distillatePh?.toFixed(1) ?? '7.0'} · Boiling point: ${
                state.distillateBpC?.toFixed(1) ?? '100.0'
              } °C · Residue: 0.00 g`
            : 'Switch to Part 2 to distil sea water and verify distillate purity.'}
        </p>
      </div>
    </div>
  );

  return (
    <WorkbenchShell
      practicalId="p8-water"
      onSelectPractical={onSelectPractical}
      onBackToDirectory={onBackToDirectory}
      dataPanel={dataPanel}
      onResetLocal={resetLocal}
    >
      {/* Part 1 / Part 2 Bar */}
      <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1 p-1 bg-slate-200/70 rounded-lg">
          <button
            type="button"
            onClick={() => setPart('analysis')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
              part === 'analysis' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
            }`}
          >
            Part 1: pH &amp; Dissolved Solids
          </button>
          <button
            type="button"
            onClick={() => setPart('distillation')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
              part === 'distillation' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
            }`}
          >
            Part 2: Simple Distillation
          </button>
        </div>

        {part === 'analysis' ? (
          <div className="flex items-center gap-1.5">
            {WATER_SAMPLES.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => handleSelectSample(s.id)}
                className={`px-2.5 py-1 text-xs font-medium rounded-md border transition-colors cursor-pointer whitespace-nowrap ${
                  sampleId === s.id
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                }`}
              >
                {s.name}
              </button>
            ))}
          </div>
        ) : (
          <span className="text-xs font-mono tabular-nums text-slate-700">
            Vapour Temp: <strong className="text-slate-900">{vapourTemp.toFixed(1)} °C</strong> ·
            Distillate: <strong className="text-blue-700">{distillateProgress}%</strong>
          </span>
        )}
      </div>

      {/* Apparatus Bench SVG */}
      <div className="p-6 bg-gradient-to-b from-slate-50/70 to-white space-y-4">
        <div className="w-full aspect-[16/9] max-h-[385px] bg-white border border-slate-200 rounded-xl overflow-hidden">
          <svg
            viewBox="0 0 720 365"
            className="w-full h-full"
            role="img"
            aria-label={part === 'analysis' ? 'Water pH and analytical balance station' : 'Simple distillation apparatus'}
          >
            <rect x="0" y="320" width="720" height="45" fill="#f1f5f9" />
            <line x1="0" y1="320" x2="720" y2="320" stroke="#cbd5e1" strokeWidth="1.5" />

            {part === 'analysis' ? (
              <g>
                {/* Left: Water sample beaker + Universal Indicator paper */}
                <path
                  d="M95 160 L95 310 Q95 318 103 318 L217 318 Q225 318 225 310 L225 160"
                  fill="#ffffff"
                  stroke="#64748b"
                  strokeWidth="2.2"
                />
                <path
                  d="M97 220 L223 220 L223 310 Q223 316 217 316 L103 316 Q97 316 97 310 Z"
                  fill="#bae6fd"
                  opacity="0.58"
                />
                {/* UI paper strip */}
                <rect
                  x="151"
                  y={phTested ? 140 : 88}
                  width="18"
                  height="96"
                  rx="2"
                  fill="#fef08a"
                  stroke="#a16207"
                  strokeWidth="1"
                />
                {phTested && (
                  <rect x="151" y="198" width="18" height="38" rx="1" fill={sample.uiColor} />
                )}
                <text x="160" y="344" textAnchor="middle" fontSize="11.5" fill="#334155" fontFamily="DM Sans">
                  {sample.name} {phTested ? `(pH ${sample.ph.toFixed(1)})` : ''}
                </text>

                {/* Right: 0.01 g Digital Analytical Balance + Evaporating Basin */}
                <rect x="370" y="252" width="230" height="68" rx="8" fill="#e2e8f0" stroke="#64748b" strokeWidth="2" />
                <rect x="415" y="242" width="140" height="10" rx="2" fill="#94a3b8" />
                {/* LCD display */}
                <rect x="410" y="270" width="150" height="34" rx="4" fill="#0f172a" />
                <text
                  x="546"
                  y="293"
                  textAnchor="end"
                  fontSize="18"
                  fontWeight="600"
                  fill="#38bdf8"
                  fontFamily="IBM Plex Mono"
                >
                  {displayedBalanceG} g
                </text>

                {/* Porcelain Evaporating Basin on Balance */}
                {(basinWeighed || finalWeighed) && (
                  <g>
                    <path
                      d="M425 208 Q485 248 545 208 Z"
                      fill="#ffffff"
                      stroke="#64748b"
                      strokeWidth="2.2"
                    />
                    {evaporated && sample.dissolvedSolidsG > 0.02 && (
                      <ellipse cx="485" cy="222" rx="28" ry="5" fill="#e2e8f0" stroke="#94a3b8" />
                    )}
                  </g>
                )}

                <text x="485" y="130" textAnchor="middle" fontSize="12" fontWeight="600" fill="#0f172a" fontFamily="Plus Jakarta Sans">
                  0.01 g Digital Analytical Balance
                </text>
                <text x="485" y="150" textAnchor="middle" fontSize="11" fill="#64748b" fontFamily="DM Sans">
                  {finalWeighed
                    ? `Dissolved solids: ${sample.dissolvedSolidsG.toFixed(2)} g`
                    : evaporated
                    ? 'Basin cooled with dry salt residue — ready to re-weigh'
                    : basinWeighed
                    ? `Empty basin = ${sample.emptyBasinG.toFixed(2)} g`
                    : 'Weigh clean empty evaporating basin first'}
                </text>
              </g>
            ) : (
              <g>
                {/* Tripod & Bunsen under Distillation Conical Flask */}
                <line x1="120" y1="242" x2="102" y2="320" stroke="#475569" strokeWidth="4" />
                <line x1="250" y1="242" x2="268" y2="320" stroke="#475569" strokeWidth="4" />
                <rect x="110" y="236" width="150" height="7" rx="2" fill="#334155" />

                {/* Bunsen */}
                <rect x="160" y="308" width="50" height="12" rx="2" fill="#475569" />
                <rect x="178" y="268" width="14" height="40" fill="#64748b" />
                {distilling && (
                  <path
                    d="M185 240 C197 254, 195 266, 185 268 C175 266, 173 254, 185 240 Z"
                    fill="#3b82f6"
                    className="animate-flame"
                  />
                )}

                {/* Conical Flask with Sea Water */}
                <path
                  d="M168 118 L168 144 L132 228 Q130 235 138 235 L232 235 Q240 235 238 228 L202 144 L202 118"
                  fill="#ffffff"
                  stroke="#64748b"
                  strokeWidth="2.2"
                />
                <path
                  d="M144 195 L226 195 L236 228 Q238 233 231 233 L139 233 Q132 233 134 228 Z"
                  fill="#0ea5e9"
                  opacity="0.45"
                />
                {/* Anti-bumping granules */}
                {granulesAdded && (
                  <g fill="#475569">
                    <circle cx="165" cy="228" r="2.5" />
                    <circle cx="182" cy="229" r="2.5" />
                    <circle cx="198" cy="228" r="2.5" />
                  </g>
                )}
                {distilling && vapourTemp >= 90 && (
                  <g fill="#ffffff" stroke="#0284c7" strokeWidth="1">
                    <circle cx="172" cy="215" r="3" className="animate-bubble" />
                    <circle cx="194" cy="210" r="3.5" className="animate-bubble" style={{ animationDelay: '0.4s' }} />
                  </g>
                )}

                {/* Bung, Thermometer & Delivery Tube */}
                <rect x="166" y="106" width="38" height="14" rx="2" fill="#334155" />
                {/* Thermometer */}
                <rect x="176" y="34" width="6" height="106" rx="3" fill="#ffffff" stroke="#475569" strokeWidth="1.2" />
                <circle cx="179" cy="138" r="4.5" fill="#dc2626" />
                {/* Delivery tube sloping into collection test tube */}
                <path
                  d="M194 106 L194 74 L488 158 L488 228"
                  fill="none"
                  stroke="#64748b"
                  strokeWidth="5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {distilling && vapourTemp >= 95 && (
                  <path
                    d="M194 106 L194 74 L488 158 L488 228"
                    fill="none"
                    stroke="#bae6fd"
                    strokeWidth="2.2"
                    strokeDasharray="6 6"
                  />
                )}

                {/* Ice-Water Condenser Bath Beaker (Right) */}
                <path
                  d="M425 186 L425 314 Q425 320 432 320 L544 320 Q551 320 551 314 L551 186"
                  fill="#e0f2fe"
                  fillOpacity="0.55"
                  stroke="#64748b"
                  strokeWidth="2.2"
                />
                {/* Ice cubes floating */}
                <rect x="434" y="198" width="22" height="16" rx="3" fill="#ffffff" stroke="#7dd3fc" />
                <rect x="520" y="202" width="22" height="16" rx="3" fill="#ffffff" stroke="#7dd3fc" />

                {/* Collection Test Tube inside Ice Bath */}
                <path
                  d="M466 164 L466 290 Q466 308 488 308 Q510 308 510 290 L510 164"
                  fill="#ffffff"
                  stroke="#475569"
                  strokeWidth="2"
                />
                {/* Condensed pure water distillate */}
                {distillateProgress > 0 && (
                  <path
                    d={`M468 ${304 - distillateProgress * 0.65} L508 ${
                      304 - distillateProgress * 0.65
                    } L508 290 Q508 306 488 306 Q468 306 468 290 Z`}
                    fill="#38bdf8"
                    opacity="0.65"
                  />
                )}

                <text x="185" y="344" textAnchor="middle" fontSize="11" fill="#334155" fontFamily="DM Sans">
                  Sea Water + Anti-Bumping Granules
                </text>
                <text x="488" y="344" textAnchor="middle" fontSize="11" fill="#0369a1" fontFamily="DM Sans">
                  Ice-Water Condenser &amp; Pure Distillate
                </text>
              </g>
            )}
          </svg>
        </div>

        {/* Bench Observation Strip */}
        <div className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 leading-relaxed">
          <span className="font-semibold text-slate-900 mr-1.5">Bench observation:</span>
          {feedback}
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {part === 'analysis' ? (
            <>
              <button
                type="button"
                onClick={handleTestPh}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-white bg-blue-700 hover:bg-blue-800 rounded-lg cursor-pointer whitespace-nowrap"
              >
                <Droplets className="w-3.5 h-3.5" aria-hidden="true" />
                1. Test pH (UI Paper)
              </button>
              <button
                type="button"
                onClick={handleWeighEmpty}
                disabled={basinWeighed}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-800 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg cursor-pointer whitespace-nowrap disabled:opacity-50"
              >
                <Scale className="w-3.5 h-3.5" aria-hidden="true" />
                2. Weigh Empty Basin
              </button>
              <button
                type="button"
                onClick={handleEvaporate}
                disabled={!basinWeighed || evaporated}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-800 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg cursor-pointer whitespace-nowrap disabled:opacity-50"
              >
                <Flame className="w-3.5 h-3.5 text-amber-600" aria-hidden="true" />
                3. Evaporate 25 cm³ to Dryness
              </button>
              <button
                type="button"
                onClick={handleFinalWeigh}
                disabled={!evaporated || finalWeighed}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg cursor-pointer whitespace-nowrap disabled:opacity-50 ml-auto"
              >
                <Check className="w-3.5 h-3.5" aria-hidden="true" />
                4. Cool &amp; Re-weigh Basin
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={handleAddGranules}
                disabled={granulesAdded}
                className="px-3.5 py-2 text-xs font-medium text-slate-800 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg cursor-pointer whitespace-nowrap disabled:opacity-50"
              >
                {granulesAdded ? 'Anti-Bumping Granules Added' : '1. Add Anti-Bumping Granules'}
              </button>
              <button
                type="button"
                onClick={handleStartDistil}
                disabled={distilling || distillateProgress >= 100}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-blue-700 hover:bg-blue-800 rounded-lg cursor-pointer whitespace-nowrap disabled:opacity-50"
              >
                <Flame className="w-3.5 h-3.5" aria-hidden="true" />
                {distilling ? 'Distilling at 100.0 °C...' : '2. Heat & Distil Sea Water'}
              </button>
              <button
                type="button"
                onClick={handleVerifyDistillate}
                disabled={distillateProgress < 100 || purityVerified}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg cursor-pointer whitespace-nowrap disabled:opacity-40 ml-auto"
              >
                <Check className="w-3.5 h-3.5" aria-hidden="true" />
                {purityVerified ? 'Distillate Verified Pure' : '3. Verify Distillate Purity'}
              </button>
            </>
          )}
        </div>
      </div>
    </WorkbenchShell>
  );
};
