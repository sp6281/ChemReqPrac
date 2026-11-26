import React, { useMemo, useState } from 'react';
import { Droplet, RefreshCw, Check } from 'lucide-react';
import { WorkbenchShell } from '../WorkbenchShell';
import { PracticalId } from '../../types/lab';
import { useLab } from '../../context/LabContext';

interface Props {
  onSelectPractical: (id: PracticalId) => void;
  onBackToDirectory: () => void;
}

// True hidden HCl concentration = 0.112 mol/dm³ -> Equivalence point for 25.0 cm³ of 0.100 mol/dm³ NaOH is 22.32 cm³
const TRUE_EQUIVALENCE_CM3 = 22.35;
const NAOH_CONC = 0.1;
const NAOH_VOL_CM3 = 25.0;

export const Practical2Titration: React.FC<Props> = ({
  onSelectPractical,
  onBackToDirectory,
}) => {
  const { state, addTitrationRun, clearTitrationRuns, completeStep } = useLab();

  const [indicator, setIndicator] = useState<'phenolphthalein' | 'methyl-orange'>('phenolphthalein');
  const [hasPipetted, setHasPipetted] = useState(false);
  const [hasIndicator, setHasIndicator] = useState(false);
  const [buretteFilled, setBuretteFilled] = useState(false);
  const [initialReading, setInitialReading] = useState(0.0);
  const [buretteReading, setBuretteReading] = useState(0.0);
  const [swirlCount, setSwirlCount] = useState(0);
  const [dripping, setDripping] = useState(false);
  const [studentConcInput, setStudentConcInput] = useState('');
  const [concFeedback, setConcFeedback] = useState<string | null>(null);
  const [feedback, setFeedback] = useState(
    'Step 1: Pipette 25.0 cm³ of 0.100 mol/dm³ NaOH into the conical flask on the white tile.'
  );

  const volumeAdded = +(buretteReading - initialReading).toFixed(2);
  const runTarget = useMemo(() => {
    // Realistic slight ±0.05 cm³ experimental jitter per run
    const offset = ((state.titrationRuns.length * 7) % 3 - 1) * 0.05;
    return +(TRUE_EQUIVALENCE_CM3 + offset).toFixed(2);
  }, [state.titrationRuns.length]);

  const isPastEndpoint = volumeAdded >= runTarget;
  const isNearEndpoint = volumeAdded >= runTarget - 0.6 && volumeAdded < runTarget;
  const isOvershot = volumeAdded > runTarget + 0.3;

  // Determine flask solution colour based on indicator and pH progression
  const getFlaskColor = () => {
    if (!hasPipetted) return 'transparent';
    if (!hasIndicator) return 'rgba(226, 232, 240, 0.5)';
    if (indicator === 'phenolphthalein') {
      if (isPastEndpoint) return 'rgba(241, 245, 249, 0.55)'; // colourless
      if (isNearEndpoint) return 'rgba(244, 114, 182, 0.42)'; // pale transient pink
      return 'rgba(219, 39, 119, 0.72)'; // vivid magenta/pink in alkali
    } else {
      if (isOvershot) return 'rgba(239, 68, 68, 0.78)'; // red in excess acid
      if (isPastEndpoint) return 'rgba(251, 146, 60, 0.78)'; // peach/orange endpoint
      return 'rgba(250, 204, 21, 0.78)'; // yellow in alkali
    }
  };

  const handlePipette = () => {
    setHasPipetted(true);
    completeStep('p2-titration', 'pipette-alkali');
    setFeedback('25.0 cm³ of 0.100 mol/dm³ NaOH transferred accurately. Now add 3 drops of indicator.');
  };

  const handleAddIndicator = () => {
    if (!hasPipetted) {
      setFeedback('Pipette the 25.0 cm³ NaOH solution into the flask first.');
      return;
    }
    setHasIndicator(true);
    completeStep('p2-titration', 'add-indicator');
    setFeedback(
      indicator === 'phenolphthalein'
        ? 'Added 3 drops of phenolphthalein — alkaline NaOH turns bright pink. Now fill the burette with HCl.'
        : 'Added 3 drops of methyl orange — alkaline NaOH turns yellow. Now fill the burette with HCl.'
    );
  };

  const handleFillBurette = () => {
    const startVal = +(Math.random() * 1.2).toFixed(1);
    setInitialReading(startVal);
    setBuretteReading(startVal);
    setBuretteFilled(true);
    completeStep('p2-titration', 'fill-burette');
    setFeedback(
      `Burette filled with HCl (funnel removed, jet filled). Initial meniscus reading: ${startVal.toFixed(
        2
      )} cm³. Open the tap to begin titrating.`
    );
  };

  const dispense = (amountCm3: number) => {
    if (!hasPipetted || !hasIndicator || !buretteFilled) {
      setFeedback('Complete flask setup (NaOH + indicator) and fill the burette before opening the tap.');
      return;
    }
    setDripping(true);
    window.setTimeout(() => setDripping(false), 360);

    setBuretteReading((prev) => {
      const next = Math.min(50.0, +(prev + amountCm3).toFixed(2));
      const added = +(next - initialReading).toFixed(2);
      if (added >= runTarget && prev - initialReading < runTarget) {
        setFeedback(
          indicator === 'phenolphthalein'
            ? `Endpoint reached at ${next.toFixed(2)} cm³! Solution turned permanently colourless (titre = ${added.toFixed(
                2
              )} cm³). Record this run.`
            : `Endpoint reached at ${next.toFixed(2)} cm³! Solution turned peach-orange (titre = ${added.toFixed(
                2
              )} cm³). Record this run.`
        );
      } else if (added >= runTarget - 1.5 && added < runTarget) {
        setFeedback(
          `Approaching endpoint (${added.toFixed(
            2
          )} cm³ added). Switch to single 0.05 cm³ drops and swirl after each drop!`
        );
      } else if (added > runTarget + 0.3) {
        setFeedback(
          `Overshot the endpoint (${added.toFixed(
            2
          )} cm³ added). Record as a rough run or start a fresh flask and add dropwise near ~22 cm³.`
        );
      }
      return next;
    });
  };

  const handleRecordRun = () => {
    if (!buretteFilled || volumeAdded <= 0) {
      setFeedback('Dispense HCl until the indicator changes colour before recording a titre.');
      return;
    }
    const runNum = state.titrationRuns.length;
    const label = runNum === 0 ? 'Rough' : `Run ${runNum}`;
    const newRun = {
      id: `${Date.now()}`,
      label,
      indicator,
      initialCm3: initialReading,
      finalCm3: buretteReading,
      titreCm3: volumeAdded,
      overshot: isOvershot,
    };
    addTitrationRun(newRun);

    if (runNum === 0) {
      completeStep('p2-titration', 'rough-titration');
    }

    // Check concordancy across all non-rough runs (or any two runs within 0.10 cm³)
    const allAccurate = [...state.titrationRuns, newRun].filter((r) => r.label !== 'Rough');
    let hasConcordant = false;
    for (let i = 0; i < allAccurate.length; i++) {
      for (let j = i + 1; j < allAccurate.length; j++) {
        if (Math.abs(allAccurate[i].titreCm3 - allAccurate[j].titreCm3) <= 0.101) {
          hasConcordant = true;
        }
      }
    }
    if (hasConcordant) {
      completeStep('p2-titration', 'concordant-runs');
    }

    // Prepare fresh flask for next run automatically
    setHasPipetted(false);
    setHasIndicator(false);
    setBuretteFilled(false);
    setFeedback(
      `${label} recorded (Titre: ${volumeAdded.toFixed(
        2
      )} cm³). Rinse conical flask and prepare the next titration run.`
    );
  };

  // Concordant runs calculation
  const concordantRuns = useMemo(() => {
    const accurate = state.titrationRuns.filter((r) => r.label !== 'Rough');
    const matched = new Set<string>();
    for (let i = 0; i < accurate.length; i++) {
      for (let j = i + 1; j < accurate.length; j++) {
        if (Math.abs(accurate[i].titreCm3 - accurate[j].titreCm3) <= 0.101) {
          matched.add(accurate[i].id);
          matched.add(accurate[j].id);
        }
      }
    }
    return accurate.filter((r) => matched.has(r.id));
  }, [state.titrationRuns]);

  const meanConcordantTitre =
    concordantRuns.length >= 2
      ? +(
          concordantRuns.reduce((sum, r) => sum + r.titreCm3, 0) / concordantRuns.length
        ).toFixed(2)
      : null;

  const expectedConc = meanConcordantTitre
    ? +((NAOH_CONC * (NAOH_VOL_CM3 / 1000)) / (meanConcordantTitre / 1000)).toFixed(3)
    : 0.112;

  const handleCheckCalculation = () => {
    const parsed = parseFloat(studentConcInput);
    if (Number.isNaN(parsed)) {
      setConcFeedback('Enter a numeric concentration in mol/dm³ (e.g. 0.112).');
      return;
    }
    if (Math.abs(parsed - expectedConc) <= 0.004) {
      completeStep('p2-titration', 'calculate-conc');
      setConcFeedback(
        `Correct! Moles NaOH = 0.100 × 0.0250 = 0.00250 mol. Using mean titre ${
          meanConcordantTitre ?? TRUE_EQUIVALENCE_CM3
        } cm³, [HCl] = ${expectedConc.toFixed(3)} mol/dm³.`
      );
    } else {
      setConcFeedback(
        `Not quite (${parsed.toFixed(3)} mol/dm³). Hint: moles NaOH = 0.100 × (25.0 ÷ 1000) = 0.00250 mol; divide by mean titre in dm³.`
      );
    }
  };

  const resetLocal = () => {
    setHasPipetted(false);
    setHasIndicator(false);
    setBuretteFilled(false);
    setInitialReading(0);
    setBuretteReading(0);
    setStudentConcInput('');
    setConcFeedback(null);
    setFeedback('Bench reset. Pipette 25.0 cm³ of 0.100 mol/dm³ NaOH into the conical flask.');
  };

  // Meniscus vertical position in zoomed inset
  const buretteFillHeight = buretteFilled ? Math.max(8, ((50 - buretteReading) / 50) * 145) : 0;

  const dataPanel = (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold text-slate-900">Titration Results Table</h3>
        {state.titrationRuns.length > 0 && (
          <button
            type="button"
            onClick={clearTitrationRuns}
            className="text-xs text-slate-500 hover:text-rose-600 cursor-pointer"
          >
            Clear Table
          </button>
        )}
      </div>

      {state.titrationRuns.length === 0 ? (
        <p className="text-xs text-slate-500">
          Complete a rough run and at least two accurate runs to populate your titration table.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500">
                <th className="py-1.5 pr-2 font-medium">Run</th>
                <th className="py-1.5 pr-2 font-medium text-right">Start</th>
                <th className="py-1.5 pr-2 font-medium text-right">End</th>
                <th className="py-1.5 font-medium text-right">Titre (cm³)</th>
              </tr>
            </thead>
            <tbody className="font-mono tabular-nums divide-y divide-slate-100">
              {state.titrationRuns.map((run) => {
                const isConcordant = concordantRuns.some((c) => c.id === run.id);
                return (
                  <tr key={run.id} className={isConcordant ? 'bg-emerald-50/50' : ''}>
                    <td className="py-1.5 pr-2 font-sans text-slate-800">
                      {run.label}
                      {isConcordant ? ' *' : ''}
                    </td>
                    <td className="py-1.5 pr-2 text-right">{run.initialCm3.toFixed(2)}</td>
                    <td className="py-1.5 pr-2 text-right">{run.finalCm3.toFixed(2)}</td>
                    <td className="py-1.5 text-right font-semibold text-slate-900">
                      {run.titreCm3.toFixed(2)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-2 text-xs">
        <div className="flex justify-between">
          <span className="text-slate-600">Concordant mean titre (within 0.10 cm³):</span>
          <span className="font-mono tabular-nums font-semibold text-slate-900">
            {meanConcordantTitre ? `${meanConcordantTitre.toFixed(2)} cm³` : 'Need 2 concordant runs'}
          </span>
        </div>
        <div className="pt-2 border-t border-slate-200 space-y-2">
          <label htmlFor="hcl-conc-input" className="block font-medium text-slate-800">
            Calculate [HCl] (mol/dm³) from your mean titre:
          </label>
          <div className="flex gap-2">
            <input
              id="hcl-conc-input"
              type="number"
              step="0.001"
              value={studentConcInput}
              onChange={(e) => setStudentConcInput(e.target.value)}
              placeholder="e.g. 0.112"
              className="flex-1 px-2.5 py-1.5 text-xs font-mono bg-white border border-slate-300 rounded-md focus:border-blue-600 focus:outline-none"
            />
            <button
              type="button"
              onClick={handleCheckCalculation}
              className="px-3 py-1.5 text-xs font-medium text-white bg-blue-700 hover:bg-blue-800 rounded-md whitespace-nowrap cursor-pointer"
            >
              Verify
            </button>
          </div>
          {concFeedback && <p className="text-xs text-slate-700 leading-relaxed">{concFeedback}</p>}
        </div>
      </div>
    </div>
  );

  return (
    <WorkbenchShell
      practicalId="p2-titration"
      onSelectPractical={onSelectPractical}
      onBackToDirectory={onBackToDirectory}
      dataPanel={dataPanel}
      onResetLocal={resetLocal}
    >
      {/* Top Instrument Strip */}
      <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-600">Indicator:</span>
          <div className="flex items-center gap-1 p-0.5 bg-slate-200/70 rounded-lg">
            {(
              [
                { id: 'phenolphthalein', label: 'Phenolphthalein' },
                { id: 'methyl-orange', label: 'Methyl Orange' },
              ] as const
            ).map((opt) => (
              <button
                key={opt.id}
                type="button"
                disabled={hasIndicator}
                onClick={() => setIndicator(opt.id)}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer disabled:opacity-60 ${
                  indicator === opt.id
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-5 text-xs font-mono tabular-nums">
          <span>
            Start: <strong className="text-slate-900">{buretteFilled ? initialReading.toFixed(2) : '—'}</strong> cm³
          </span>
          <span>
            Current: <strong className="text-blue-700">{buretteFilled ? buretteReading.toFixed(2) : '—'}</strong> cm³
          </span>
          <span>
            Added: <strong className="text-slate-900">{buretteFilled ? volumeAdded.toFixed(2) : '0.00'}</strong> cm³
          </span>
        </div>
      </div>

      {/* Interactive SVG Titration Bench + Zoomed Meniscus Lens */}
      <div className="p-6 bg-gradient-to-b from-slate-50/70 to-white">
        <div className="w-full aspect-[16/9] max-h-[410px] bg-white border border-slate-200 rounded-xl relative overflow-hidden">
          <svg
            viewBox="0 0 720 390"
            className="w-full h-full"
            role="img"
            aria-label="Acid-alkali titration burette and conical flask on white tile"
          >
            {/* Bench surface */}
            <rect x="0" y="340" width="720" height="50" fill="#f1f5f9" />
            <line x1="0" y1="340" x2="720" y2="340" stroke="#cbd5e1" strokeWidth="1.5" />

            {/* Retort stand & clamp */}
            <rect x="175" y="330" width="130" height="10" fill="#475569" />
            <rect x="200" y="25" width="8" height="305" fill="#64748b" />
            <rect x="208" y="102" width="102" height="8" fill="#475569" />
            <circle cx="310" cy="106" r="7" fill="#334155" />

            {/* 50 cm3 Burette */}
            <rect x="314" y="28" width="14" height="162" fill="#ffffff" stroke="#64748b" strokeWidth="1.8" />
            {buretteFilled && (
              <rect
                x="315.5"
                y={188 - buretteFillHeight}
                width="11"
                height={buretteFillHeight}
                fill="#bae6fd"
                opacity="0.7"
              />
            )}
            {/* Burette scale marks */}
            {[0, 10, 20, 30, 40, 50].map((v) => {
              const y = 38 + (v / 50) * 145;
              return (
                <g key={v}>
                  <line x1="314" y1={y} x2="322" y2={y} stroke="#475569" strokeWidth="1" />
                  <text x="333" y={y + 3} fontSize="8.5" fill="#64748b" fontFamily="IBM Plex Mono">
                    {v}
                  </text>
                </g>
              );
            })}
            {/* Tap / Stopcock */}
            <polygon points="316,190 326,190 323,218 319,218" fill="#ffffff" stroke="#64748b" strokeWidth="1.5" />
            <rect x="307" y="198" width="28" height="6" rx="2" fill="#1d4ed8" />

            {/* Falling acid drop */}
            {dripping && <circle cx="321" cy="224" r="3" fill="#0284c7" className="animate-drip" />}

            {/* White ceramic tile */}
            <rect x="262" y="330" width="118" height="10" rx="1.5" fill="#ffffff" stroke="#94a3b8" strokeWidth="1.5" />

            {/* Conical flask (with gentle swirl offset) */}
            <g transform={`translate(${swirlCount % 2 === 1 ? 3 : 0}, 0)`}>
              <path
                d="M308 238 L308 258 L272 324 Q270 330 278 330 L364 330 Q372 330 370 324 L334 258 L334 238"
                fill="#ffffff"
                fillOpacity="0.75"
                stroke="#64748b"
                strokeWidth="2.2"
              />
              {hasPipetted && (
                <path
                  d="M286 298 L356 298 L368 324 Q370 328 363 328 L279 328 Q272 328 274 324 Z"
                  fill={getFlaskColor()}
                />
              )}
              <text x="321" y="356" textAnchor="middle" fontSize="11" fill="#475569" fontFamily="DM Sans">
                White Tile · 25.0 cm³ NaOH (0.100 mol/dm³)
              </text>
            </g>

            {/* Magnified Meniscus Reader HUD on Right */}
            <g transform="translate(465, 42)">
              <rect x="0" y="0" width="215" height="240" rx="10" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1.5" />
              <text x="16" y="24" fontSize="11" fontWeight="600" fill="#0f172a" fontFamily="Plus Jakarta Sans">
                Eye-Level Meniscus Zoom
              </text>
              <text x="16" y="40" fontSize="10" fill="#64748b" fontFamily="DM Sans">
                Read bottom of curved meniscus to 0.05 cm³
              </text>

              {/* Zoomed tube window */}
              <rect x="64" y="56" width="84" height="136" rx="4" fill="#ffffff" stroke="#94a3b8" strokeWidth="1.5" />
              {buretteFilled ? (
                <>
                  {/* Liquid below meniscus */}
                  <path
                    d="M65 118 Q106 130 147 118 L147 191 L65 191 Z"
                    fill="#bae6fd"
                    opacity="0.75"
                  />
                  {/* Curved meniscus line */}
                  <path d="M65 118 Q106 130 147 118" fill="none" stroke="#0284c7" strokeWidth="2.2" />
                  {/* Horizontal eye-level guide at bottom of meniscus */}
                  <line
                    x1="54"
                    y1="124"
                    x2="158"
                    y2="124"
                    stroke="#1d4ed8"
                    strokeWidth="1"
                    strokeDasharray="4 3"
                  />
                  {/* Dynamic ticks centered around current burette reading */}
                  {[-0.4, -0.3, -0.2, -0.1, 0, 0.1, 0.2, 0.3, 0.4].map((delta) => {
                    const val = +(buretteReading + delta).toFixed(2);
                    if (val < 0 || val > 50) return null;
                    const y = 124 + delta * 120;
                    const isMajor = Math.abs(Math.round(val * 2) - val * 2) < 0.02;
                    return (
                      <g key={delta}>
                        <line
                          x1="64"
                          y1={y}
                          x2={isMajor ? 88 : 78}
                          y2={y}
                          stroke="#334155"
                          strokeWidth={isMajor ? 1.4 : 0.9}
                        />
                        {isMajor && (
                          <text x="93" y={y + 3.5} fontSize="10" fill="#334155" fontFamily="IBM Plex Mono">
                            {val.toFixed(1)}
                          </text>
                        )}
                      </g>
                    );
                  })}
                </>
              ) : (
                <text x="106" y="128" textAnchor="middle" fontSize="11" fill="#94a3b8" fontFamily="DM Sans">
                  Empty Burette
                </text>
              )}

              <text x="107" y="218" textAnchor="middle" fontSize="15" fontWeight="600" fill="#0f172a" fontFamily="IBM Plex Mono">
                {buretteFilled ? `${buretteReading.toFixed(2)} cm³` : '— cm³'}
              </text>
            </g>
          </svg>
        </div>

        {/* Bench feedback */}
        <div className="mt-4 px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 leading-relaxed">
          <span className="font-semibold text-slate-900 mr-1.5">Titration status:</span>
          {feedback}
        </div>

        {/* Setup & Burette Valve Controls */}
        <div className="mt-4 flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handlePipette}
            disabled={hasPipetted}
            className="px-3.5 py-2 text-xs font-medium text-slate-800 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg whitespace-nowrap cursor-pointer disabled:opacity-50"
          >
            {hasPipetted ? '25.0 cm³ NaOH Ready' : '1. Pipette 25.0 cm³ NaOH'}
          </button>

          <button
            type="button"
            onClick={handleAddIndicator}
            disabled={!hasPipetted || hasIndicator}
            className="px-3.5 py-2 text-xs font-medium text-slate-800 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg whitespace-nowrap cursor-pointer disabled:opacity-50"
          >
            {hasIndicator ? 'Indicator Added' : '2. Add 3 Drops Indicator'}
          </button>

          <button
            type="button"
            onClick={handleFillBurette}
            disabled={buretteFilled}
            className="px-3.5 py-2 text-xs font-medium text-slate-800 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg whitespace-nowrap cursor-pointer disabled:opacity-50"
          >
            {buretteFilled ? 'Burette Filled' : '3. Fill Burette (HCl)'}
          </button>

          <div className="h-5 w-px bg-slate-200 mx-1 hidden sm:block" aria-hidden="true" />

          <button
            type="button"
            onClick={() => dispense(5.0)}
            disabled={!buretteFilled || !hasIndicator}
            className="px-3 py-2 text-xs font-medium text-white bg-blue-700 hover:bg-blue-800 rounded-lg whitespace-nowrap cursor-pointer disabled:opacity-40"
          >
            +5.00 cm³
          </button>
          <button
            type="button"
            onClick={() => dispense(1.0)}
            disabled={!buretteFilled || !hasIndicator}
            className="px-3 py-2 text-xs font-medium text-white bg-blue-700 hover:bg-blue-800 rounded-lg whitespace-nowrap cursor-pointer disabled:opacity-40"
          >
            +1.00 cm³
          </button>
          <button
            type="button"
            onClick={() => dispense(0.2)}
            disabled={!buretteFilled || !hasIndicator}
            className="px-3 py-2 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg whitespace-nowrap cursor-pointer disabled:opacity-40"
          >
            +0.20 cm³
          </button>
          <button
            type="button"
            onClick={() => dispense(0.05)}
            disabled={!buretteFilled || !hasIndicator}
            className="inline-flex items-center gap-1 px-3 py-2 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg whitespace-nowrap cursor-pointer disabled:opacity-40"
          >
            <Droplet className="w-3.5 h-3.5" aria-hidden="true" />
            +1 Drop (0.05)
          </button>

          <button
            type="button"
            onClick={() => setSwirlCount((c) => c + 1)}
            disabled={!hasPipetted}
            className="inline-flex items-center gap-1 px-3 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg whitespace-nowrap cursor-pointer disabled:opacity-40"
          >
            <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
            Swirl Flask
          </button>

          <button
            type="button"
            onClick={handleRecordRun}
            disabled={!buretteFilled || volumeAdded <= 0}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg whitespace-nowrap cursor-pointer disabled:opacity-40 ml-auto"
          >
            <Check className="w-3.5 h-3.5" aria-hidden="true" />
            Record Titre
          </button>
        </div>
      </div>
    </WorkbenchShell>
  );
};
