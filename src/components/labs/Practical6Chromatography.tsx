import React, { useEffect, useState } from 'react';
import { Play, Ruler, Check } from 'lucide-react';
import { WorkbenchShell } from '../WorkbenchShell';
import { PracticalId } from '../../types/lab';
import { useLab } from '../../context/LabContext';

interface Props {
  onSelectPractical: (id: PracticalId) => void;
  onBackToDirectory: () => void;
}

interface DyeSample {
  id: string;
  label: string;
  xPos: number;
  spots: { color: string; rf: number; name: string }[];
}

// Known dyes A-D and Unknown U (mixture of A and C)
const DYES: DyeSample[] = [
  { id: 'A', label: 'Dye A (Red)', xPos: 235, spots: [{ color: '#dc2626', rf: 0.75, name: 'Carmoisine' }] },
  { id: 'B', label: 'Dye B (Blue)', xPos: 300, spots: [{ color: '#2563eb', rf: 0.45, name: 'Brilliant Blue' }] },
  { id: 'C', label: 'Dye C (Yellow)', xPos: 365, spots: [{ color: '#eab308', rf: 0.25, name: 'Tartrazine' }] },
  { id: 'D', label: 'Dye D (Green)', xPos: 430, spots: [{ color: '#16a34a', rf: 0.60, name: 'Green S' }] },
  {
    id: 'U',
    label: 'Unknown U',
    xPos: 495,
    spots: [
      { color: '#dc2626', rf: 0.75, name: 'Unknown upper spot' },
      { color: '#eab308', rf: 0.25, name: 'Unknown lower spot' },
    ],
  },
];

const SOLVENT_MAX_MM = 80.0; // Clean 80.0 mm solvent rise from pencil baseline

export const Practical6Chromatography: React.FC<Props> = ({
  onSelectPractical,
  onBackToDirectory,
}) => {
  const { state, upsertChromatographyRecord, clearChromatographyRecords, completeStep } = useLab();

  const [baselineType, setBaselineType] = useState<'none' | 'pencil' | 'ink'>('none');
  const [spotted, setSpotted] = useState(false);
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(0); // 0 to 1
  const [showRuler, setShowRuler] = useState(false);
  const [rulerYmm, setRulerYmm] = useState(60); // interactive crosshair measurement in mm from baseline
  const [selectedSampleForLog, setSelectedSampleForLog] = useState('A');
  const [unknownGuess, setUnknownGuess] = useState('');
  const [guessFeedback, setGuessFeedback] = useState<string | null>(null);
  const [feedback, setFeedback] = useState(
    'Step 1: Draw a start line 20 mm from the bottom of the chromatography paper using either pencil or pen.'
  );

  useEffect(() => {
    if (!running) return;
    const timer = window.setInterval(() => {
      setProgress((prev) => {
        const next = Math.min(1, +(prev + 0.04).toFixed(2));
        if (next >= 1) {
          setRunning(false);
          if (baselineType === 'ink') {
            setFeedback(
              'Oh no! The ink baseline dissolved in the water and smeared up the chromatogram, ruining the spots. Reset and draw the baseline in insoluble graphite pencil.'
            );
          } else {
            completeStep('p6-chromatography', 'develop-chromatogram');
            setShowRuler(true);
            setFeedback(
              'Solvent front reached 80.0 mm above the pencil line! Use the interactive mm ruler to measure each spot centre and record its Rf value.'
            );
          }
        }
        return next;
      });
    }, 140);
    return () => window.clearInterval(timer);
  }, [running, baselineType, completeStep]);

  const handleDrawBaseline = (type: 'pencil' | 'ink') => {
    setBaselineType(type);
    setProgress(0);
    setRunning(false);
    if (type === 'pencil') {
      completeStep('p6-chromatography', 'draw-pencil-line');
      setFeedback(
        'Graphite pencil baseline drawn 20 mm from the bottom (insoluble in water). Next, spot known dyes A–D and Unknown U.'
      );
    } else {
      setFeedback(
        'Warning: Pen ink is soluble in water! You can run the chromatogram to see why chemists strictly use pencil.'
      );
    }
  };

  const handleSpotDyes = () => {
    if (baselineType === 'none') {
      setFeedback('Draw the baseline 20 mm from the bottom before spotting the dyes.');
      return;
    }
    setSpotted(true);
    completeStep('p6-chromatography', 'spot-dyes');
    setFeedback(
      'Small concentrated spots of A, B, C, D and Unknown U placed along the line. Lower the paper into shallow water (below the baseline) and start.'
    );
  };

  const handleStartRun = () => {
    if (!spotted) {
      setFeedback('Spot the dyes onto the baseline before lowering the paper into the solvent.');
      return;
    }
    setProgress(0.02);
    setRunning(true);
    setFeedback('Capillary action drawing water solvent up the stationary phase...');
  };

  const handleLogMeasurement = () => {
    if (progress < 1 || baselineType !== 'pencil') {
      setFeedback('Complete a valid chromatogram (with pencil baseline) before recording Rf values.');
      return;
    }
    const sample = DYES.find((d) => d.id === selectedSampleForLog)!;
    const rf = +(rulerYmm / SOLVENT_MAX_MM).toFixed(2);
    upsertChromatographyRecord({
      sampleId: `${sample.id}-${Math.round(rulerYmm)}`,
      sampleLabel: sample.label,
      spotDistanceMm: rulerYmm,
      solventFrontMm: SOLVENT_MAX_MM,
      rfValue: rf,
    });
    completeStep('p6-chromatography', 'measure-rf');
    setFeedback(
      `Logged ${sample.label}: spot = ${rulerYmm.toFixed(1)} mm, solvent front = ${SOLVENT_MAX_MM.toFixed(
        1
      )} mm → Rf = ${rf.toFixed(2)}.`
    );
  };

  const handleCheckUnknown = () => {
    const clean = unknownGuess.toUpperCase().replace(/\s+/g, '');
    if ((clean.includes('A') && clean.includes('C')) && !clean.includes('B') && !clean.includes('D')) {
      completeStep('p6-chromatography', 'measure-rf');
      setGuessFeedback(
        'Correct! Unknown U separated into two spots with Rf = 0.75 (matching Dye A) and Rf = 0.25 (matching Dye C).'
      );
    } else {
      setGuessFeedback(
        'Compare the vertical height and colour of both spots in column U against columns A, B, C, and D.'
      );
    }
  };

  const resetLocal = () => {
    setBaselineType('none');
    setSpotted(false);
    setRunning(false);
    setProgress(0);
    setShowRuler(false);
    setGuessFeedback(null);
    setFeedback('Fresh chromatography paper mounted. Draw your baseline 20 mm from the bottom.');
  };

  // Paper baseline is at SVG y = 285; 80 mm solvent front corresponds to 192 px up (2.4 px per mm)
  const pxPerMm = 2.4;
  const baselineY = 285;
  const solventFrontY = baselineY - progress * SOLVENT_MAX_MM * pxPerMm;
  const rulerLineY = baselineY - rulerYmm * pxPerMm;

  const dataPanel = (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold text-slate-900">Rf Calculation Table</h3>
        {state.chromatographyRecords.length > 0 && (
          <button
            type="button"
            onClick={clearChromatographyRecords}
            className="text-xs text-slate-500 hover:text-rose-600 cursor-pointer"
          >
            Clear
          </button>
        )}
      </div>

      {state.chromatographyRecords.length === 0 ? (
        <p className="text-xs text-slate-500">
          Develop the chromatogram, align the mm ruler crosshair to a spot centre, and log its Rf value.
        </p>
      ) : (
        <table className="w-full text-xs text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 text-slate-500">
              <th className="py-1.5 pr-2 font-medium">Sample</th>
              <th className="py-1.5 pr-2 font-medium text-right">Spot (mm)</th>
              <th className="py-1.5 font-medium text-right">Rf</th>
            </tr>
          </thead>
          <tbody className="font-mono tabular-nums divide-y divide-slate-100">
            {state.chromatographyRecords.map((r) => (
              <tr key={r.sampleId}>
                <td className="py-1.5 pr-2 font-sans text-slate-800">{r.sampleLabel}</td>
                <td className="py-1.5 pr-2 text-right">{r.spotDistanceMm.toFixed(1)}</td>
                <td className="py-1.5 text-right font-semibold text-blue-700">{r.rfValue.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-2 text-xs">
        <label htmlFor="unknown-u-input" className="block font-medium text-slate-800">
          Which two known dyes make up Unknown U?
        </label>
        <div className="flex gap-2">
          <input
            id="unknown-u-input"
            type="text"
            value={unknownGuess}
            onChange={(e) => setUnknownGuess(e.target.value)}
            placeholder="e.g. A and C"
            className="flex-1 px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-md focus:border-blue-600 focus:outline-none"
          />
          <button
            type="button"
            onClick={handleCheckUnknown}
            className="px-3 py-1.5 text-xs font-medium text-white bg-blue-700 hover:bg-blue-800 rounded-md cursor-pointer"
          >
            Check
          </button>
        </div>
        {guessFeedback && <p className="text-slate-700 leading-relaxed">{guessFeedback}</p>}
      </div>
    </div>
  );

  return (
    <WorkbenchShell
      practicalId="p6-chromatography"
      onSelectPractical={onSelectPractical}
      onBackToDirectory={onBackToDirectory}
      dataPanel={dataPanel}
      onResetLocal={resetLocal}
    >
      {/* Top Controls Strip */}
      <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
        <div className="text-xs font-mono tabular-nums text-slate-700">
          Solvent Front:{' '}
          <strong className="text-slate-900">{(progress * SOLVENT_MAX_MM).toFixed(1)} mm</strong>
          {showRuler && (
            <>
              {' '}
              · Ruler Crosshair: <strong className="text-blue-700">{rulerYmm.toFixed(1)} mm</strong>{' '}
              (Rf = {(rulerYmm / SOLVENT_MAX_MM).toFixed(2)})
            </>
          )}
        </div>

        <button
          type="button"
          onClick={() => setShowRuler((v) => !v)}
          disabled={progress < 1}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-800 bg-white border border-slate-300 hover:bg-slate-50 rounded-md cursor-pointer disabled:opacity-40"
        >
          <Ruler className="w-3.5 h-3.5 text-blue-700" aria-hidden="true" />
          {showRuler ? 'Hide mm Ruler' : 'Show mm Ruler'}
        </button>
      </div>

      {/* Interactive Chromatography Tank SVG */}
      <div className="p-6 bg-gradient-to-b from-slate-50/70 to-white space-y-4">
        <div className="w-full aspect-[16/9] max-h-[400px] bg-white border border-slate-200 rounded-xl relative overflow-hidden">
          <svg
            viewBox="0 0 720 375"
            className="w-full h-full"
            role="img"
            aria-label="Paper chromatography tank and interactive millimetre ruler"
          >
            {/* Bench */}
            <rect x="0" y="340" width="720" height="35" fill="#f1f5f9" />
            <line x1="0" y1="340" x2="720" y2="340" stroke="#cbd5e1" strokeWidth="1.5" />

            {/* Glass Chromatography Beaker / Tank */}
            <rect x="165" y="42" width="400" height="298" rx="6" fill="#f8fafc" stroke="#64748b" strokeWidth="2.2" />
            {/* Glass rod holding paper */}
            <rect x="150" y="54" width="430" height="8" rx="4" fill="#94a3b8" />

            {/* Shallow water solvent below pencil baseline */}
            <rect x="167" y="308" width="396" height="30" fill="#bae6fd" opacity="0.65" />
            <text x="582" y="326" fontSize="10.5" fill="#0369a1" fontFamily="DM Sans">
              Water solvent
            </text>

            {/* Chromatography filter paper */}
            <rect x="195" y="62" width="340" height="266" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1.5" />

            {/* Wet solvent front climbing up paper */}
            {progress > 0 && (
              <>
                <rect
                  x="196"
                  y={solventFrontY}
                  width="338"
                  height={327 - solventFrontY}
                  fill="#e0f2fe"
                  opacity="0.32"
                />
                <line
                  x1="196"
                  y1={solventFrontY}
                  x2="534"
                  y2={solventFrontY}
                  stroke="#0284c7"
                  strokeWidth="1.5"
                  strokeDasharray="5 3"
                />
                <text x="582" y={solventFrontY + 4} fontSize="10.5" fill="#0284c7" fontFamily="IBM Plex Mono">
                  Solvent front ({(progress * SOLVENT_MAX_MM).toFixed(0)} mm)
                </text>
              </>
            )}

            {/* Baseline (Pencil vs Ink) */}
            {baselineType === 'pencil' && (
              <line x1="205" y1={baselineY} x2="525" y2={baselineY} stroke="#475569" strokeWidth="1.5" />
            )}
            {baselineType === 'ink' && (
              <>
                <line x1="205" y1={baselineY} x2="525" y2={baselineY} stroke="#1d4ed8" strokeWidth="2" />
                {progress > 0 && (
                  <rect
                    x="205"
                    y={baselineY - progress * 110}
                    width="320"
                    height={progress * 110}
                    fill="#3b82f6"
                    opacity="0.28"
                  />
                )}
              </>
            )}

            {/* Dye spots migrating smoothly */}
            {spotted &&
              DYES.map((dye) => (
                <g key={dye.id}>
                  <text
                    x={dye.xPos}
                    y={302}
                    textAnchor="middle"
                    fontSize="11"
                    fontWeight="600"
                    fill="#334155"
                    fontFamily="IBM Plex Mono"
                  >
                    {dye.id}
                  </text>
                  {dye.spots.map((spot, i) => {
                    const cy = baselineY - progress * spot.rf * SOLVENT_MAX_MM * pxPerMm;
                    return (
                      <ellipse
                        key={i}
                        cx={dye.xPos}
                        cy={cy}
                        rx="9"
                        ry={progress > 0.2 ? 6.5 : 5}
                        fill={spot.color}
                        opacity={progress > 0.1 ? 0.85 : 0.95}
                      />
                    );
                  })}
                </g>
              ))}

            {/* Interactive Virtual Millimetre Ruler */}
            {showRuler && (
              <g>
                <rect x="115" y="75" width="44" height="225" rx="3" fill="#fefce8" stroke="#ca8a04" strokeWidth="1.4" />
                {[0, 10, 20, 30, 40, 50, 60, 70, 80].map((mm) => {
                  const y = baselineY - mm * pxPerMm;
                  return (
                    <g key={mm}>
                      <line x1="145" y1={y} x2="159" y2={y} stroke="#713f12" strokeWidth="1.2" />
                      <text x="141" y={y + 3} textAnchor="end" fontSize="9" fill="#713f12" fontFamily="IBM Plex Mono">
                        {mm}
                      </text>
                    </g>
                  );
                })}
                {/* Horizontal measurement crosshair */}
                <line
                  x1="159"
                  y1={rulerLineY}
                  x2="535"
                  y2={rulerLineY}
                  stroke="#1d4ed8"
                  strokeWidth="1.4"
                  strokeDasharray="4 2"
                />
                <text x="582" y={rulerLineY + 4} fontSize="10.5" fontWeight="600" fill="#1d4ed8" fontFamily="IBM Plex Mono">
                  {rulerYmm.toFixed(1)} mm
                </text>
              </g>
            )}
          </svg>
        </div>

        {/* Ruler Position Slider & Log Tool (when ruler active) */}
        {showRuler && progress >= 1 && baselineType === 'pencil' && (
          <div className="p-3.5 bg-blue-50/60 border border-blue-200 rounded-lg flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-3 flex-1 min-w-[220px]">
              <label htmlFor="ruler-slider" className="text-xs font-medium text-slate-800 whitespace-nowrap">
                Align Ruler: <span className="font-mono text-blue-800">{rulerYmm.toFixed(1)} mm</span>
              </label>
              <input
                id="ruler-slider"
                type="range"
                min={0}
                max={80}
                step={0.5}
                value={rulerYmm}
                onChange={(e) => setRulerYmm(parseFloat(e.target.value))}
                className="flex-1 accent-blue-700 cursor-pointer"
              />
            </div>

            <select
              aria-label="Select sample to record"
              value={selectedSampleForLog}
              onChange={(e) => setSelectedSampleForLog(e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-md"
            >
              {DYES.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.label}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={handleLogMeasurement}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-white bg-emerald-700 hover:bg-emerald-800 rounded-md cursor-pointer whitespace-nowrap"
            >
              <Check className="w-3.5 h-3.5" aria-hidden="true" />
              Log Rf ({(rulerYmm / SOLVENT_MAX_MM).toFixed(2)})
            </button>
          </div>
        )}

        {/* Bench feedback */}
        <div className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700">
          <span className="font-semibold text-slate-900 mr-1.5">Chromatogram status:</span>
          {feedback}
        </div>

        {/* Bench Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => handleDrawBaseline('pencil')}
            disabled={running}
            className="px-3.5 py-2 text-xs font-medium text-slate-800 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg cursor-pointer whitespace-nowrap disabled:opacity-50"
          >
            1a. Draw Pencil Line
          </button>

          <button
            type="button"
            onClick={() => handleDrawBaseline('ink')}
            disabled={running}
            className="px-3.5 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer whitespace-nowrap disabled:opacity-50"
          >
            1b. Try Ink Pen Line
          </button>

          <button
            type="button"
            onClick={handleSpotDyes}
            disabled={baselineType === 'none' || spotted || running}
            className="px-3.5 py-2 text-xs font-medium text-slate-800 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg cursor-pointer whitespace-nowrap disabled:opacity-50"
          >
            {spotted ? 'Dyes A–D & U Spotted' : '2. Spot Dyes A–D & U'}
          </button>

          <button
            type="button"
            onClick={handleStartRun}
            disabled={!spotted || running || progress >= 1}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-blue-700 hover:bg-blue-800 rounded-lg cursor-pointer whitespace-nowrap disabled:opacity-40 ml-auto"
          >
            <Play className="w-3.5 h-3.5" aria-hidden="true" />
            {running ? 'Running Solvent...' : '3. Lower into Water & Run'}
          </button>
        </div>
      </div>
    </WorkbenchShell>
  );
};
