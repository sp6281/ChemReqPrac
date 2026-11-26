import React, { useMemo, useState } from 'react';
import { Plus, Thermometer, Check } from 'lucide-react';
import { WorkbenchShell } from '../WorkbenchShell';
import { PracticalId } from '../../types/lab';
import { useLab } from '../../context/LabContext';

interface Props {
  onSelectPractical: (id: PracticalId) => void;
  onBackToDirectory: () => void;
}

// Realistic AQA Calorimetry model (30 cm³ of 1.0 mol/dm³ HCl + 5 cm³ portions of 1.2 mol/dm³ NaOH -> peaks at 25 cm³)
function simulateTemp(volumeCm3: number, mode: 'exothermic' | 'endothermic'): number {
  const jitter = (((volumeCm3 * 13) % 5) - 2) * 0.08;
  if (mode === 'exothermic') {
    const t0 = 20.5;
    if (volumeCm3 <= 25) {
      return +(t0 + volumeCm3 * 0.36 + jitter).toFixed(1);
    }
    // Cooling slightly as excess room-temp NaOH dilutes the warm solution
    return +(t0 + 25 * 0.36 - (volumeCm3 - 25) * 0.16 + jitter).toFixed(1);
  } else {
    // Citric acid + sodium hydrogencarbonate solution (endothermic drop)
    const t0 = 21.0;
    if (volumeCm3 <= 25) {
      return +(t0 - volumeCm3 * 0.24 + jitter).toFixed(1);
    }
    return +(t0 - 25 * 0.24 + (volumeCm3 - 25) * 0.08 + jitter).toFixed(1);
  }
}

export const Practical4TempChanges: React.FC<Props> = ({
  onSelectPractical,
  onBackToDirectory,
}) => {
  const { state, addTempReading, clearTempReadings, completeStep } = useLab();

  const [mode, setMode] = useState<'exothermic' | 'endothermic'>('exothermic');
  const [cupReady, setCupReady] = useState(false);
  const [lidOn, setLidOn] = useState(true);
  const [volumeAdded, setVolumeAdded] = useState(0);
  const [currentTemp, setCurrentTemp] = useState(20.5);
  const [feedback, setFeedback] = useState(
    'Set up the polystyrene cup inside the glass beaker with 30 cm³ of acid, then record the starting temperature at 0 cm³.'
  );

  const modeReadings = useMemo(
    () => state.tempReadings.filter((r) => r.mode === mode),
    [state.tempReadings, mode]
  );

  const handleSetup = () => {
    setCupReady(true);
    setVolumeAdded(0);
    const startT = simulateTemp(0, mode);
    setCurrentTemp(startT);
    completeStep('p4-temp-changes', 'setup-calorimeter');
    setFeedback(
      `30 cm³ of ${
        mode === 'exothermic' ? 'dilute HCl' : 'citric acid'
      } measured into the insulated polystyrene cup. Record the initial temperature (0 cm³).`
    );
  };

  const handleRecordTemp = () => {
    if (!cupReady) {
      setFeedback('Set up the polystyrene cup with 30 cm³ of acid first.');
      return;
    }
    const recordedTemp = lidOn
      ? currentTemp
      : +(currentTemp + (mode === 'exothermic' ? -0.6 : 0.4)).toFixed(1);

    addTempReading({ volumeCm3: volumeAdded, tempC: recordedTemp, mode });

    if (volumeAdded === 0) {
      completeStep('p4-temp-changes', 'record-initial-temp');
      setFeedback(
        `Initial temperature (${recordedTemp.toFixed(1)} °C) logged. Add 5 cm³ of ${
          mode === 'exothermic' ? 'NaOH' : 'NaHCO₃'
        } and stir gently.`
      );
    } else {
      const nextCount = new Set([...modeReadings.map((r) => r.volumeCm3), volumeAdded]).size;
      if (volumeAdded >= 35 && nextCount >= 7) {
        completeStep('p4-temp-changes', 'add-portions');
        completeStep('p4-temp-changes', 'analyse-graph');
        setFeedback(
          `Logged ${volumeAdded} cm³ → ${recordedTemp.toFixed(
            1
          )} °C. Full calorimetry curve plotted! Inspect the intersection of the two best-fit lines.`
        );
      } else {
        setFeedback(
          `Logged ${volumeAdded} cm³ → ${recordedTemp.toFixed(
            1
          )} °C. Add the next 5 cm³ portion and record the equilibrated temperature.`
        );
      }
    }
  };

  const handleAddPortion = () => {
    if (!cupReady) {
      setFeedback('Measure 30 cm³ of acid into the polystyrene cup before adding reagent.');
      return;
    }
    if (volumeAdded >= 40) {
      setFeedback('Maximum 40 cm³ added. Analyse your graph or switch reaction type.');
      return;
    }
    const nextVol = volumeAdded + 5;
    const nextTemp = simulateTemp(nextVol, mode);
    setVolumeAdded(nextVol);
    setCurrentTemp(nextTemp);
    setFeedback(
      `Added 5 cm³ portion (total ${nextVol} cm³) and stirred with thermometer. Stabilised reading: ${nextTemp.toFixed(
        1
      )} °C. Click "Record Temperature".`
    );
  };

  const handleSwitchMode = (nextMode: 'exothermic' | 'endothermic') => {
    setMode(nextMode);
    setCupReady(false);
    setVolumeAdded(0);
    setCurrentTemp(nextMode === 'exothermic' ? 20.5 : 21.0);
    setFeedback(
      nextMode === 'exothermic'
        ? 'Switched to Exothermic Neutralisation (HCl + NaOH). Set up the polystyrene cup.'
        : 'Switched to Endothermic Reaction (Citric Acid + NaHCO₃). Set up the polystyrene cup.'
    );
  };

  const resetLocal = () => {
    setCupReady(false);
    setVolumeAdded(0);
    setCurrentTemp(mode === 'exothermic' ? 20.5 : 21.0);
    setFeedback('Calorimeter reset. Set up the polystyrene cup with 30 cm³ of acid.');
  };

  // Graph bounds & coordinate mapping
  const minT = mode === 'exothermic' ? 18 : 12;
  const maxT = mode === 'exothermic' ? 32 : 24;
  const mapX = (vol: number) => 46 + (vol / 40) * 234;
  const mapY = (t: number) => 170 - ((t - minT) / (maxT - minT)) * 140;

  const deltaT = useMemo(() => {
    if (modeReadings.length < 2) return null;
    const t0 = modeReadings.find((r) => r.volumeCm3 === 0)?.tempC ?? modeReadings[0].tempC;
    const extreme =
      mode === 'exothermic'
        ? Math.max(...modeReadings.map((r) => r.tempC))
        : Math.min(...modeReadings.map((r) => r.tempC));
    return +(extreme - t0).toFixed(1);
  }, [modeReadings, mode]);

  // Visual thermometer mercury height
  const mercuryRatio = Math.max(0.05, Math.min(1, (currentTemp - 10) / 28));

  const dataPanel = (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold text-slate-900">
          {mode === 'exothermic' ? 'Exothermic' : 'Endothermic'} Data Table
        </h3>
        {modeReadings.length > 0 && (
          <button
            type="button"
            onClick={clearTempReadings}
            className="text-xs text-slate-500 hover:text-rose-600 cursor-pointer"
          >
            Clear
          </button>
        )}
      </div>

      {modeReadings.length === 0 ? (
        <p className="text-xs text-slate-500">
          Record the 0 cm³ initial temperature and each 5 cm³ addition up to 40 cm³.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500">
                <th className="py-1.5 pr-3 font-medium">Volume Added (cm³)</th>
                <th className="py-1.5 font-medium text-right">Temperature (°C)</th>
              </tr>
            </thead>
            <tbody className="font-mono tabular-nums divide-y divide-slate-100">
              {modeReadings.map((r) => (
                <tr key={r.volumeCm3}>
                  <td className="py-1.5 pr-3 text-slate-800">{r.volumeCm3.toFixed(1)}</td>
                  <td className="py-1.5 text-right font-semibold text-slate-900">
                    {r.tempC.toFixed(1)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {deltaT !== null && (
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs space-y-1">
          <p className="font-semibold text-slate-900">
            Observed ΔT:{' '}
            <span className="font-mono tabular-nums text-blue-700">
              {deltaT > 0 ? `+${deltaT.toFixed(1)}` : deltaT.toFixed(1)} °C
            </span>
          </p>
          <p className="text-slate-600">
            {mode === 'exothermic'
              ? 'Temperature rises until all HCl is neutralised (~25 cm³), then falls as excess cooler NaOH is added.'
              : 'Temperature decreases as energy is taken in from the surroundings until reaction completes (~25 cm³).'}
          </p>
        </div>
      )}
    </div>
  );

  return (
    <WorkbenchShell
      practicalId="p4-temp-changes"
      onSelectPractical={onSelectPractical}
      onBackToDirectory={onBackToDirectory}
      dataPanel={dataPanel}
      onResetLocal={resetLocal}
    >
      {/* Mode & Lid Bar */}
      <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1 p-1 bg-slate-200/70 rounded-lg">
          <button
            type="button"
            onClick={() => handleSwitchMode('exothermic')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
              mode === 'exothermic'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Exothermic (HCl + NaOH)
          </button>
          <button
            type="button"
            onClick={() => handleSwitchMode('endothermic')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
              mode === 'endothermic'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Endothermic (Citric Acid + NaHCO₃)
          </button>
        </div>

        <label className="inline-flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
          <input
            type="checkbox"
            checked={lidOn}
            onChange={(e) => setLidOn(e.target.checked)}
            className="rounded accent-blue-700"
          />
          Cardboard lid fitted (reduces heat loss)
        </label>
      </div>

      {/* Split Apparatus + Live Scatter Graph Stage */}
      <div className="p-6 bg-gradient-to-b from-slate-50/70 to-white">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Left: Polystyrene Cup Calorimeter */}
          <div className="bg-white border border-slate-200 rounded-xl p-3 flex flex-col justify-between">
            <svg
              viewBox="0 0 340 310"
              className="w-full h-[270px]"
              role="img"
              aria-label="Polystyrene cup calorimeter inside glass beaker with thermometer"
            >
              <rect x="0" y="275" width="340" height="35" fill="#f1f5f9" />
              <line x1="0" y1="275" x2="340" y2="275" stroke="#cbd5e1" strokeWidth="1.5" />

              {/* Outer 250 cm3 glass beaker (for stability) */}
              <path
                d="M92 145 L92 268 Q92 274 99 274 L221 274 Q228 274 228 268 L228 145"
                fill="#f8fafc"
                fillOpacity="0.6"
                stroke="#64748b"
                strokeWidth="2"
              />

              {/* Inner Insulated Polystyrene Cup */}
              <polygon
                points="102,118 218,118 206,266 114,266"
                fill="#ffffff"
                stroke="#94a3b8"
                strokeWidth="2"
              />

              {/* Solution level inside cup */}
              {cupReady && (
                <polygon
                  points={`${110 - volumeAdded * 0.12},${214 - volumeAdded * 1.1} ${
                    210 + volumeAdded * 0.12
                  },${214 - volumeAdded * 1.1} 204,264 116,264`}
                  fill={mode === 'exothermic' ? 'rgba(186, 230, 253, 0.7)' : 'rgba(224, 242, 254, 0.75)'}
                />
              )}

              {/* Cardboard Lid */}
              {lidOn && (
                <rect x="94" y="112" width="132" height="8" rx="2" fill="#d97706" opacity="0.72" />
              )}

              {/* Glass Thermometer */}
              <rect x="155" y="22" width="10" height="224" rx="5" fill="#ffffff" stroke="#475569" strokeWidth="1.5" />
              <circle cx="160" cy="244" r="8" fill="#dc2626" />
              {/* Rising/falling red alcohol column */}
              <rect
                x="158"
                y={236 - mercuryRatio * 180}
                width="4"
                height={mercuryRatio * 180 + 4}
                fill="#dc2626"
              />

              {/* Digital readout box */}
              <rect x="234" y="26" width="94" height="58" rx="8" fill="#f8fafc" stroke="#cbd5e1" />
              <text x="244" y="45" fontSize="10" fill="#64748b" fontFamily="DM Sans">
                Thermometer
              </text>
              <text
                x="244"
                y="70"
                fontSize="18"
                fontWeight="600"
                fill={mode === 'exothermic' && currentTemp > 25 ? '#c2410c' : '#0369a1'}
                fontFamily="IBM Plex Mono"
              >
                {currentTemp.toFixed(1)} °C
              </text>

              <text x="160" y="297" textAnchor="middle" fontSize="11" fill="#475569" fontFamily="DM Sans">
                Total Reagent Added: {volumeAdded} cm³
              </text>
            </svg>
          </div>

          {/* Right: Live Calorimetry Scatter Graph with 2 Best-Fit Lines */}
          <div className="bg-white border border-slate-200 rounded-xl p-3 flex flex-col justify-between">
            <div className="flex items-center justify-between px-1 pb-1">
              <p className="text-xs font-semibold text-slate-900">
                Temperature vs Volume Added
              </p>
              <span className="text-[11px] font-mono text-slate-500">Two-line best fit</span>
            </div>
            <svg
              viewBox="0 0 300 210"
              className="w-full h-[240px]"
              role="img"
              aria-label="Live temperature versus volume scatter graph"
            >
              {/* Grid lines */}
              {[0, 10, 20, 30, 40].map((v) => (
                <g key={v}>
                  <line
                    x1={mapX(v)}
                    y1={30}
                    x2={mapX(v)}
                    y2={170}
                    stroke="#e2e8f0"
                    strokeWidth="1"
                  />
                  <text
                    x={mapX(v)}
                    y={184}
                    textAnchor="middle"
                    fontSize="9"
                    fill="#64748b"
                    fontFamily="IBM Plex Mono"
                  >
                    {v}
                  </text>
                </g>
              ))}
              {[0, 0.25, 0.5, 0.75, 1].map((frac) => {
                const tempVal = +(minT + frac * (maxT - minT)).toFixed(0);
                const y = mapY(tempVal);
                return (
                  <g key={frac}>
                    <line x1={46} y1={y} x2={280} y2={y} stroke="#e2e8f0" strokeWidth="1" />
                    <text
                      x={40}
                      y={y + 3}
                      textAnchor="end"
                      fontSize="9"
                      fill="#64748b"
                      fontFamily="IBM Plex Mono"
                    >
                      {tempVal}
                    </text>
                  </g>
                );
              })}

              {/* Axes */}
              <line x1="46" y1="30" x2="46" y2="170" stroke="#475569" strokeWidth="1.5" />
              <line x1="46" y1="170" x2="280" y2="170" stroke="#475569" strokeWidth="1.5" />
              <text x="163" y="200" textAnchor="middle" fontSize="9.5" fill="#475569" fontFamily="DM Sans">
                Volume of {mode === 'exothermic' ? 'NaOH' : 'NaHCO₃'} added (cm³)
              </text>
              <text
                x="13"
                y="102"
                textAnchor="middle"
                fontSize="9.5"
                fill="#475569"
                fontFamily="DM Sans"
                transform="rotate(-90 13 102)"
              >
                Temp (°C)
              </text>

              {/* Rising & Cooling best-fit lines once enough points exist */}
              {modeReadings.length >= 6 && (
                <>
                  <line
                    x1={mapX(0)}
                    y1={mapY(mode === 'exothermic' ? 20.5 : 21.0)}
                    x2={mapX(25)}
                    y2={mapY(mode === 'exothermic' ? 29.5 : 15.0)}
                    stroke="#2563eb"
                    strokeWidth="1.5"
                    strokeDasharray="4 3"
                  />
                  <line
                    x1={mapX(25)}
                    y1={mapY(mode === 'exothermic' ? 29.5 : 15.0)}
                    x2={mapX(40)}
                    y2={mapY(mode === 'exothermic' ? 27.1 : 16.2)}
                    stroke="#0284c7"
                    strokeWidth="1.5"
                    strokeDasharray="4 3"
                  />
                </>
              )}

              {/* Plotted empirical points */}
              {modeReadings.map((pt) => (
                <circle
                  key={pt.volumeCm3}
                  cx={mapX(pt.volumeCm3)}
                  cy={mapY(pt.tempC)}
                  r="4"
                  fill="#1d4ed8"
                  stroke="#ffffff"
                  strokeWidth="1.2"
                />
              ))}
            </svg>
          </div>
        </div>

        {/* Bench feedback */}
        <div className="mt-4 px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 leading-relaxed">
          <span className="font-semibold text-slate-900 mr-1.5">Calorimeter reading:</span>
          {feedback}
        </div>

        {/* Action controls */}
        <div className="mt-4 flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handleSetup}
            disabled={cupReady}
            className="px-4 py-2 text-xs font-medium text-slate-800 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg whitespace-nowrap cursor-pointer disabled:opacity-50"
          >
            {cupReady ? '30 cm³ Acid in Cup' : '1. Measure 30 cm³ Acid'}
          </button>

          <button
            type="button"
            onClick={handleAddPortion}
            disabled={!cupReady || volumeAdded >= 40}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-blue-700 hover:bg-blue-800 rounded-lg whitespace-nowrap cursor-pointer disabled:opacity-40"
          >
            <Plus className="w-3.5 h-3.5" aria-hidden="true" />
            Add 5 cm³ {mode === 'exothermic' ? 'NaOH' : 'NaHCO₃'} &amp; Stir
          </button>

          <button
            type="button"
            onClick={handleRecordTemp}
            disabled={!cupReady}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg whitespace-nowrap cursor-pointer disabled:opacity-40 ml-auto"
          >
            <Check className="w-3.5 h-3.5" aria-hidden="true" />
            <Thermometer className="w-3.5 h-3.5" aria-hidden="true" />
            Record {currentTemp.toFixed(1)} °C ({volumeAdded} cm³)
          </button>
        </div>
      </div>
    </WorkbenchShell>
  );
};
