import React, { useEffect, useState } from 'react';
import { Flame, Filter, Sparkles, Droplets, Thermometer } from 'lucide-react';
import { WorkbenchShell } from '../WorkbenchShell';
import { PracticalId } from '../../types/lab';
import { useLab } from '../../context/LabContext';

interface Props {
  onSelectPractical: (id: PracticalId) => void;
  onBackToDirectory: () => void;
}

type Stage = 'reaction' | 'filtration' | 'evaporation' | 'crystallisation';

export const Practical1Salts: React.FC<Props> = ({ onSelectPractical, onBackToDirectory }) => {
  const { completeStep, saveSaltTrial, state } = useLab();

  const [stage, setStage] = useState<Stage>('reaction');
  const [acidAdded, setAcidAdded] = useState(false);
  const [bunsenOn, setBunsenOn] = useState(false);
  const [tempC, setTempC] = useState(21.0);
  const [cuoSpatulas, setCuoSpatulas] = useState(0);
  const [stirredCount, setStirredCount] = useState(0);
  const [filteredProgress, setFilteredProgress] = useState(0);
  const [evapProgress, setEvapProgress] = useState(0);
  const [evapHeating, setEvapHeating] = useState(false);
  const [cooled, setCooled] = useState(false);
  const [pattedDry, setPattedDry] = useState(false);
  const [feedback, setFeedback] = useState(
    'Start by measuring 40 cm³ of dilute sulfuric acid into the beaker.'
  );

  // Heating simulation during reaction stage
  useEffect(() => {
    if (stage !== 'reaction' || !bunsenOn || !acidAdded) return;
    const timer = window.setInterval(() => {
      setTempC((prev) => {
        const next = Math.min(98, +(prev + 1.8).toFixed(1));
        if (next >= 48 && next < 52) {
          completeStep('p1-salts', 'warm-acid');
          setFeedback(
            'Acid warmed to ~50 °C. Turn off the Bunsen burner so it does not boil, then add CuO spatula by spatula.'
          );
        }
        if (next >= 85) {
          setFeedback(
            'Safety caution: Sulfuric acid is getting too hot and could spit! Switch off the Bunsen burner immediately.'
          );
        }
        return next;
      });
    }, 320);
    return () => window.clearInterval(timer);
  }, [stage, bunsenOn, acidAdded, completeStep]);

  // Cooling slowly when burner off
  useEffect(() => {
    if (stage !== 'reaction' || bunsenOn || tempC <= 22) return;
    const timer = window.setInterval(() => {
      setTempC((prev) => Math.max(21.0, +(prev - 0.3).toFixed(1)));
    }, 900);
    return () => window.clearInterval(timer);
  }, [stage, bunsenOn, tempC]);

  // Filtration animation
  useEffect(() => {
    if (stage !== 'filtration' || filteredProgress <= 0 || filteredProgress >= 100) return;
    const timer = window.setInterval(() => {
      setFilteredProgress((prev) => {
        const next = Math.min(100, prev + 8);
        if (next >= 100) {
          completeStep('p1-salts', 'filter-excess');
          setFeedback(
            'Filtration complete: black unreacted CuO remains on the filter paper as residue, and clear blue CuSO₄ solution is collected as filtrate.'
          );
        }
        return next;
      });
    }, 220);
    return () => window.clearInterval(timer);
  }, [stage, filteredProgress, completeStep]);

  // Evaporation animation
  useEffect(() => {
    if (stage !== 'evaporation' || !evapHeating) return;
    const timer = window.setInterval(() => {
      setEvapProgress((prev) => {
        const next = Math.min(100, prev + 5);
        if (next >= 60 && next < 68) {
          completeStep('p1-salts', 'evaporate-water-bath');
          setFeedback(
            'Crystallisation point reached (~half volume evaporated and crystals forming at the rim). Stop heating and move to cooling!'
          );
        }
        if (next >= 96) {
          setEvapHeating(false);
          setFeedback(
            'Caution: Evaporating completely to dryness decomposes hydrated blue CuSO₄·5H₂O into white anhydrous powder. Stop around 60–75% next time.'
          );
        }
        return next;
      });
    }, 280);
    return () => window.clearInterval(timer);
  }, [stage, evapHeating, completeStep]);

  const handleAddAcid = () => {
    setAcidAdded(true);
    completeStep('p1-salts', 'measure-acid');
    setFeedback(
      '40 cm³ of 1.0 mol/dm³ H₂SO₄ measured into the beaker. Now warm it gently to ~50 °C (do not boil).'
    );
  };

  const handleAddCuO = () => {
    if (!acidAdded) {
      setFeedback('Measure the dilute sulfuric acid into the beaker before adding copper(II) oxide.');
      return;
    }
    const next = Math.min(6, cuoSpatulas + 1);
    setCuoSpatulas(next);
    if (tempC < 38) {
      setFeedback(
        `Added spatula ${next} of black CuO powder. Reaction is slow when cold—warm the acid gently to ~50 °C and stir.`
      );
    } else if (next < 4) {
      setFeedback(
        `Added spatula ${next} of CuO. Stir to dissolve—the solution turns deeper blue as CuSO₄ forms. Keep adding until excess black solid remains.`
      );
    } else {
      setFeedback(
        `Added spatula ${next} of CuO. Excess unreacted black CuO powder now remains at the bottom, proving all acid has been neutralised. Stir once more, then filter.`
      );
    }
  };

  const handleStir = () => {
    if (!acidAdded || cuoSpatulas === 0) {
      setFeedback('Add sulfuric acid and copper(II) oxide before stirring.');
      return;
    }
    const nextStir = stirredCount + 1;
    setStirredCount(nextStir);
    if (cuoSpatulas >= 4) {
      completeStep('p1-salts', 'add-excess-cuo');
      setFeedback(
        'Stirred thoroughly: black excess CuO still remains undissolved in the blue CuSO₄ solution. Proceed to Filtration.'
      );
    } else {
      setFeedback(
        'All CuO dissolved! Add more spatulas of CuO until excess solid remains so no unreacted acid is left behind.'
      );
    }
  };

  const handleStartFiltration = () => {
    if (cuoSpatulas < 4) {
      setFeedback(
        'Technique check: Add excess CuO (at least 4 spatulas) and stir until unreacted black solid remains before filtering.'
      );
      return;
    }
    setBunsenOn(false);
    setStage('filtration');
    setFilteredProgress(10);
    setFeedback('Pouring mixture into fluted filter paper to separate insoluble excess CuO from blue CuSO₄ filtrate...');
  };

  const handleMoveToEvaporation = () => {
    if (filteredProgress < 100) {
      setFeedback('Wait for filtration to finish collecting the clear blue filtrate.');
      return;
    }
    setStage('evaporation');
    setFeedback(
      'Clear blue CuSO₄ filtrate transferred to the porcelain evaporating basin over a water bath. Heat gently until ~60% evaporated.'
    );
  };

  const handleCoolCrystallise = () => {
    setEvapHeating(false);
    if (evapProgress < 45) {
      setFeedback('Evaporate more water over the water bath until the solution becomes saturated (~60%) before cooling.');
      return;
    }
    setStage('crystallisation');
    setCooled(true);
    setFeedback(
      'Left on a cool bench: bright blue diamond-shaped copper(II) sulfate crystals have grown. Now pat dry between filter papers.'
    );
  };

  const handlePatDry = () => {
    if (!cooled) return;
    setPattedDry(true);
    completeStep('p1-salts', 'cool-and-dry');
    const yieldG = +(7.4 + (evapProgress >= 55 && evapProgress <= 80 ? 1.2 : 0.4)).toFixed(2);
    saveSaltTrial({
      acidVolumeCm3: 40,
      warmedTempC: Math.max(50, Math.round(tempC)),
      cuoSpatulas,
      filteredClearBlue: true,
      crystallised: true,
      dryYieldG: yieldG,
    });
    setFeedback(
      `Pure, dry hydrated copper(II) sulfate crystals (yield ${yieldG.toFixed(2)} g) recorded in your Lab Notebook.`
    );
  };

  const resetLocal = () => {
    setStage('reaction');
    setAcidAdded(false);
    setBunsenOn(false);
    setTempC(21.0);
    setCuoSpatulas(0);
    setStirredCount(0);
    setFilteredProgress(0);
    setEvapProgress(0);
    setEvapHeating(false);
    setCooled(false);
    setPattedDry(false);
    setFeedback('Bench reset. Measure 40 cm³ of dilute sulfuric acid into the beaker.');
  };

  // Liquid color shifts from clear to vibrant copper sulfate blue
  const reactedRatio = Math.min(1, cuoSpatulas / 4);
  const liquidColor =
    cuoSpatulas === 0
      ? 'rgba(226, 232, 240, 0.45)'
      : `rgba(${Math.round(220 - 195 * reactedRatio)}, ${Math.round(
          235 - 105 * reactedRatio
        )}, ${Math.round(245 - 15 * reactedRatio)}, 0.82)`;

  const dataPanel = (
    <div className="space-y-4">
      <div className="space-y-1">
        <h3 className="text-xs font-semibold text-slate-900">Recorded Synthesis Parameters</h3>
        <p className="text-xs text-slate-500">
          Values captured automatically as you complete each preparation stage.
        </p>
      </div>
      <dl className="divide-y divide-slate-100 text-xs">
        <div className="py-2 flex justify-between">
          <dt className="text-slate-600">Dilute H₂SO₄ (1.0 mol/dm³)</dt>
          <dd className="font-mono tabular-nums font-medium text-slate-900">
            {acidAdded ? '40.0 cm³' : '—'}
          </dd>
        </div>
        <div className="py-2 flex justify-between">
          <dt className="text-slate-600">Current Beaker Temp</dt>
          <dd className="font-mono tabular-nums font-medium text-slate-900">
            {tempC.toFixed(1)} °C
          </dd>
        </div>
        <div className="py-2 flex justify-between">
          <dt className="text-slate-600">CuO Spatulas Added</dt>
          <dd className="font-mono tabular-nums font-medium text-slate-900">
            {cuoSpatulas} {cuoSpatulas >= 4 ? '(excess)' : ''}
          </dd>
        </div>
        <div className="py-2 flex justify-between">
          <dt className="text-slate-600">Filtrate Appearance</dt>
          <dd className="font-medium text-slate-900">
            {filteredProgress >= 100 ? 'Clear royal blue solution' : 'Pending filtration'}
          </dd>
        </div>
        <div className="py-2 flex justify-between">
          <dt className="text-slate-600">Dry Crystal Yield</dt>
          <dd className="font-mono tabular-nums font-medium text-slate-900">
            {state.saltTrial ? `${state.saltTrial.dryYieldG.toFixed(2)} g` : 'Pending drying'}
          </dd>
        </div>
      </dl>
    </div>
  );

  return (
    <WorkbenchShell
      practicalId="p1-salts"
      onSelectPractical={onSelectPractical}
      onBackToDirectory={onBackToDirectory}
      dataPanel={dataPanel}
      onResetLocal={resetLocal}
    >
      {/* Stage Navigation Header */}
      <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1 p-1 bg-slate-200/70 rounded-lg">
          {(
            [
              { id: 'reaction', label: '1. React Excess Oxide' },
              { id: 'filtration', label: '2. Filter' },
              { id: 'evaporation', label: '3. Evaporate' },
              { id: 'crystallisation', label: '4. Crystallise & Dry' },
            ] as { id: Stage; label: string }[]
          ).map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setStage(s.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                stage === s.id
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-4 text-xs font-mono tabular-nums text-slate-700">
          <span className="inline-flex items-center gap-1">
            <Thermometer className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
            {tempC.toFixed(1)} °C
          </span>
          <span>CuO: {cuoSpatulas} spatulas</span>
        </div>
      </div>

      {/* Interactive SVG Bench Canvas */}
      <div className="p-6 bg-gradient-to-b from-slate-50/70 to-white">
        <div className="w-full aspect-[16/9] max-h-[400px] bg-white border border-slate-200 rounded-xl relative overflow-hidden flex items-center justify-center">
          <svg
            viewBox="0 0 720 380"
            className="w-full h-full"
            role="img"
            aria-label="Making copper(II) sulfate salts interactive apparatus"
          >
            {/* Bench surface */}
            <rect x="0" y="330" width="720" height="50" fill="#f1f5f9" />
            <line x1="0" y1="330" x2="720" y2="330" stroke="#cbd5e1" strokeWidth="1.5" />

            {stage === 'reaction' && (
              <g>
                {/* Tripod & gauze */}
                <line x1="255" y1="228" x2="232" y2="330" stroke="#475569" strokeWidth="4" />
                <line x1="465" y1="228" x2="488" y2="330" stroke="#475569" strokeWidth="4" />
                <line x1="360" y1="228" x2="360" y2="330" stroke="#64748b" strokeWidth="3" />
                <rect x="245" y="220" width="230" height="8" rx="2" fill="#334155" />
                {/* Wire gauze */}
                <rect x="275" y="216" width="170" height="4" fill="#94a3b8" />

                {/* Bunsen burner */}
                <rect x="330" y="318" width="60" height="12" rx="2" fill="#475569" />
                <rect x="352" y="268" width="16" height="50" fill="#64748b" />
                <rect x="348" y="294" width="24" height="10" rx="2" fill="#334155" />
                {bunsenOn && (
                  <g className="animate-flame">
                    <path
                      d="M360 226 C374 244, 372 264, 360 268 C348 264, 346 244, 360 226 Z"
                      fill="#3b82f6"
                      opacity="0.82"
                    />
                    <path
                      d="M360 242 C366 252, 365 264, 360 268 C355 264, 354 252, 360 242 Z"
                      fill="#93c5fd"
                    />
                  </g>
                )}

                {/* Glass beaker */}
                <path
                  d="M295 100 L295 210 Q295 216 302 216 L418 216 Q425 216 425 210 L425 100"
                  fill="#ffffff"
                  fillOpacity="0.65"
                  stroke="#64748b"
                  strokeWidth="2.5"
                />
                {/* Beaker graduations */}
                <line x1="305" y1="190" x2="318" y2="190" stroke="#94a3b8" strokeWidth="1" />
                <line x1="305" y1="165" x2="322" y2="165" stroke="#94a3b8" strokeWidth="1" />
                <line x1="305" y1="140" x2="318" y2="140" stroke="#94a3b8" strokeWidth="1" />
                <text x="326" y="169" fontSize="10" fill="#64748b" fontFamily="IBM Plex Mono">
                  40 cm³
                </text>

                {/* Acid / CuSO4 solution */}
                {acidAdded && (
                  <path
                    d="M297 154 L297 210 Q297 214 302 214 L418 214 Q423 214 423 210 L423 154 Z"
                    fill={liquidColor}
                  />
                )}

                {/* Unreacted black CuO powder at bottom */}
                {cuoSpatulas > 0 && (
                  <ellipse
                    cx="360"
                    cy="211"
                    rx={cuoSpatulas >= 4 ? 44 : 22}
                    ry={cuoSpatulas >= 4 ? 5 : 3}
                    fill="#1e293b"
                    opacity={cuoSpatulas >= 4 ? 0.95 : stirredCount > 0 ? 0.25 : 0.75}
                  />
                )}

                {/* Glass stirring rod */}
                <line
                  x1={stirredCount % 2 === 0 ? 395 : 375}
                  y1="62"
                  x2={stirredCount % 2 === 0 ? 345 : 365}
                  y2="206"
                  stroke="#94a3b8"
                  strokeWidth="4"
                  strokeLinecap="round"
                />

                {/* Steam when warm */}
                {acidAdded && tempC > 44 && (
                  <g className="animate-steam" stroke="#94a3b8" strokeWidth="1.5" fill="none">
                    <path d="M335 140 Q328 122 336 105" />
                    <path d="M360 138 Q368 120 360 100" />
                    <path d="M385 140 Q378 122 386 105" />
                  </g>
                )}

                {/* Thermometer probe on right */}
                <rect x="520" y="96" width="120" height="62" rx="8" fill="#f8fafc" stroke="#cbd5e1" />
                <text x="534" y="118" fontSize="11" fill="#64748b" fontFamily="DM Sans">
                  Solution Temp
                </text>
                <text
                  x="534"
                  y="144"
                  fontSize="20"
                  fontWeight="600"
                  fill={tempC >= 80 ? '#dc2626' : '#0f172a'}
                  fontFamily="IBM Plex Mono"
                >
                  {tempC.toFixed(1)} °C
                </text>
              </g>
            )}

            {stage === 'filtration' && (
              <g>
                {/* Retort stand */}
                <rect x="210" y="320" width="120" height="10" fill="#475569" />
                <rect x="236" y="65" width="8" height="255" fill="#64748b" />
                <rect x="244" y="148" width="90" height="8" fill="#475569" />

                {/* Conical flask collecting filtrate */}
                <path
                  d="M348 214 L348 232 L305 322 Q303 328 310 328 L410 328 Q417 328 415 322 L372 232 L372 214"
                  fill="#ffffff"
                  stroke="#64748b"
                  strokeWidth="2.5"
                />
                {/* Blue filtrate level */}
                {filteredProgress > 0 && (
                  <path
                    d={`M${312 + (100 - filteredProgress) * 0.25} ${326 - filteredProgress * 0.52} L${
                      408 - (100 - filteredProgress) * 0.25
                    } ${326 - filteredProgress * 0.52} L413 326 L307 326 Z`}
                    fill="#0284c7"
                    opacity="0.78"
                  />
                )}

                {/* Glass funnel & fluted filter paper */}
                <polygon
                  points="318,124 402,124 366,192 366,226 354,226 354,192"
                  fill="#f8fafc"
                  stroke="#64748b"
                  strokeWidth="2"
                />
                {/* Filter paper cone */}
                <polygon
                  points="324,116 396,116 360,188"
                  fill="#ffffff"
                  stroke="#cbd5e1"
                  strokeWidth="1.5"
                />
                {/* Black CuO residue trapped on paper */}
                <path d="M342 154 L378 154 L360 186 Z" fill="#1e293b" opacity="0.88" />

                {/* Falling blue drops */}
                {filteredProgress > 0 && filteredProgress < 100 && (
                  <circle cx="360" cy="240" r="3.5" fill="#0284c7" className="animate-drip" />
                )}

                {/* Labels */}
                <text x="430" y="150" fontSize="12" fill="#334155" fontFamily="DM Sans">
                  Residue: excess black CuO(s)
                </text>
                <text x="430" y="290" fontSize="12" fill="#0369a1" fontFamily="DM Sans">
                  Filtrate: clear blue CuSO₄(aq)
                </text>
              </g>
            )}

            {stage === 'evaporation' && (
              <g>
                {/* Tripod */}
                <line x1="255" y1="228" x2="232" y2="330" stroke="#475569" strokeWidth="4" />
                <line x1="465" y1="228" x2="488" y2="330" stroke="#475569" strokeWidth="4" />
                <rect x="245" y="220" width="230" height="8" rx="2" fill="#334155" />

                {/* Water bath beaker */}
                <path
                  d="M285 130 L285 215 Q285 220 292 220 L428 220 Q435 220 435 215 L435 130"
                  fill="#e0f2fe"
                  fillOpacity="0.45"
                  stroke="#64748b"
                  strokeWidth="2"
                />
                <rect x="287" y="168" width="146" height="50" fill="#bae6fd" opacity="0.55" />

                {/* Porcelain evaporating basin */}
                <path
                  d="M276 112 Q360 168 444 112 Z"
                  fill="#ffffff"
                  stroke="#64748b"
                  strokeWidth="2.5"
                />
                {/* Blue solution reducing in volume */}
                <path
                  d={`M${294 + evapProgress * 0.28} ${118 + evapProgress * 0.12} Q360 ${
                    155 - evapProgress * 0.05
                  } ${426 - evapProgress * 0.28} ${118 + evapProgress * 0.12} Z`}
                  fill={evapProgress >= 95 ? '#e2e8f0' : '#0284c7'}
                  opacity="0.85"
                />

                {/* Bunsen under water bath */}
                <rect x="330" y="318" width="60" height="12" rx="2" fill="#475569" />
                <rect x="352" y="268" width="16" height="50" fill="#64748b" />
                {evapHeating && (
                  <g className="animate-flame">
                    <path
                      d="M360 226 C374 244, 372 264, 360 268 C348 264, 346 244, 360 226 Z"
                      fill="#3b82f6"
                      opacity="0.82"
                    />
                  </g>
                )}

                {evapHeating && (
                  <g className="animate-steam" stroke="#94a3b8" strokeWidth="1.5" fill="none">
                    <path d="M335 106 Q328 84 336 66" />
                    <path d="M360 104 Q368 82 360 62" />
                    <path d="M385 106 Q378 84 386 66" />
                  </g>
                )}

                <rect x="495" y="102" width="165" height="68" rx="8" fill="#f8fafc" stroke="#cbd5e1" />
                <text x="510" y="124" fontSize="11" fill="#64748b" fontFamily="DM Sans">
                  Water Evaporated
                </text>
                <text x="510" y="152" fontSize="20" fontWeight="600" fill="#0f172a" fontFamily="IBM Plex Mono">
                  {evapProgress}%
                </text>
              </g>
            )}

            {stage === 'crystallisation' && (
              <g>
                {/* Filter paper sheet on bench */}
                <ellipse cx="360" cy="235" rx="145" ry="52" fill="#ffffff" stroke="#cbd5e1" strokeWidth="2" />
                <ellipse cx="360" cy="235" rx="125" ry="42" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="1" />

                {/* Hydrated blue copper(II) sulfate diamond crystals */}
                <g fill="#0284c7" stroke="#0369a1" strokeWidth="1.5">
                  <polygon points="320,226 338,214 352,226 336,240" />
                  <polygon points="354,234 374,220 392,236 370,252" fill="#0ea5e9" />
                  <polygon points="390,220 408,210 420,224 402,235" />
                  <polygon points="304,244 322,234 334,248 318,258" fill="#0369a1" />
                  <polygon points="342,248 358,240 368,254 352,262" />
                  <polygon points="376,214 388,205 398,218 386,225" fill="#38bdf8" />
                </g>

                <text x="360" y="138" textAnchor="middle" fontSize="14" fontWeight="600" fill="#0f172a" fontFamily="Plus Jakarta Sans">
                  {pattedDry
                    ? 'Pure, Dry CuSO₄·5H₂O Crystals Ready'
                    : 'Crystallised Blue Copper(II) Sulfate'}
                </text>
                <text x="360" y="160" textAnchor="middle" fontSize="12" fill="#475569" fontFamily="DM Sans">
                  {pattedDry
                    ? 'Patted gently dry between two sheets of filter paper'
                    : 'Click "Pat Dry with Filter Paper" to remove residual surface moisture'}
                </text>
              </g>
            )}
          </svg>
        </div>

        {/* Contextual live bench feedback */}
        <div className="mt-4 px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 leading-relaxed">
          <span className="font-semibold text-slate-900 mr-1.5">Bench observation:</span>
          {feedback}
        </div>

        {/* Tactile Apparatus Controls */}
        <div className="mt-4 flex flex-wrap items-center gap-2.5">
          {stage === 'reaction' && (
            <>
              <button
                type="button"
                onClick={handleAddAcid}
                disabled={acidAdded}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-lg border transition-colors whitespace-nowrap cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed bg-white border-slate-300 text-slate-800 hover:bg-slate-50"
              >
                <Droplets className="w-3.5 h-3.5 text-blue-600" aria-hidden="true" />
                {acidAdded ? '40 cm³ H₂SO₄ Added' : 'Measure 40 cm³ H₂SO₄'}
              </button>

              <button
                type="button"
                onClick={() => setBunsenOn((v) => !v)}
                disabled={!acidAdded}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                  bunsenOn
                    ? 'bg-amber-600 text-white hover:bg-amber-700'
                    : 'bg-slate-900 text-white hover:bg-slate-800'
                }`}
              >
                <Flame className="w-3.5 h-3.5" aria-hidden="true" />
                {bunsenOn ? 'Turn Off Bunsen' : 'Warm Acid (Bunsen)'}
              </button>

              <button
                type="button"
                onClick={handleAddCuO}
                disabled={!acidAdded || cuoSpatulas >= 6}
                className="px-3.5 py-2 text-xs font-medium text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors whitespace-nowrap cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add Spatula of CuO ({cuoSpatulas}/6)
              </button>

              <button
                type="button"
                onClick={handleStir}
                disabled={!acidAdded || cuoSpatulas === 0}
                className="px-3.5 py-2 text-xs font-medium text-slate-800 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors whitespace-nowrap cursor-pointer disabled:opacity-50"
              >
                Stir with Glass Rod
              </button>

              <button
                type="button"
                onClick={handleStartFiltration}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors whitespace-nowrap cursor-pointer ml-auto"
              >
                <Filter className="w-3.5 h-3.5" aria-hidden="true" />
                Pour into Filter Funnel
              </button>
            </>
          )}

          {stage === 'filtration' && (
            <>
              <button
                type="button"
                onClick={() => setFilteredProgress((p) => (p === 0 ? 10 : p))}
                disabled={filteredProgress > 0}
                className="px-4 py-2 text-xs font-medium text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors whitespace-nowrap cursor-pointer disabled:opacity-50"
              >
                {filteredProgress >= 100
                  ? 'Filtration Complete'
                  : filteredProgress > 0
                  ? `Filtering... ${filteredProgress}%`
                  : 'Pour Mixture through Filter Paper'}
              </button>
              <button
                type="button"
                onClick={handleMoveToEvaporation}
                disabled={filteredProgress < 100}
                className="px-4 py-2 text-xs font-medium text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap cursor-pointer disabled:opacity-50"
              >
                Transfer Filtrate to Evaporating Basin
              </button>
            </>
          )}

          {stage === 'evaporation' && (
            <>
              <button
                type="button"
                onClick={() => setEvapHeating((v) => !v)}
                className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                  evapHeating
                    ? 'bg-amber-600 text-white hover:bg-amber-700'
                    : 'bg-blue-700 text-white hover:bg-blue-800'
                }`}
              >
                <Flame className="w-3.5 h-3.5" aria-hidden="true" />
                {evapHeating ? 'Stop Water Bath Heating' : 'Heat Gently Over Water Bath'}
              </button>
              <button
                type="button"
                onClick={handleCoolCrystallise}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-blue-700" aria-hidden="true" />
                Leave to Cool &amp; Crystallise
              </button>
            </>
          )}

          {stage === 'crystallisation' && (
            <button
              type="button"
              onClick={handlePatDry}
              disabled={pattedDry}
              className="px-4 py-2 text-xs font-medium text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors whitespace-nowrap cursor-pointer disabled:opacity-50"
            >
              {pattedDry ? 'Crystals Dried & Recorded' : 'Pat Dry Between Filter Papers'}
            </button>
          )}
        </div>
      </div>
    </WorkbenchShell>
  );
};
