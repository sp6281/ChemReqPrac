import React, { useState } from 'react';
import { Power, Flame, FileText, Check } from 'lucide-react';
import { WorkbenchShell } from '../WorkbenchShell';
import { PracticalId } from '../../types/lab';
import { useLab } from '../../context/LabContext';

interface Props {
  onSelectPractical: (id: PracticalId) => void;
  onBackToDirectory: () => void;
}

interface ElectrolyteSpec {
  id: string;
  name: string;
  formula: string;
  liquidColor: string;
  cathodeType: 'copper' | 'hydrogen';
  cathodeProduct: string;
  cathodeObs: string;
  anodeType: 'chlorine' | 'oxygen';
  anodeProduct: string;
  anodeObs: string;
  litmusResult: string;
  burningSplintResult: string;
  glowingSplintResult: string;
}

const ELECTROLYTES: ElectrolyteSpec[] = [
  {
    id: 'cucl2',
    name: 'Copper(II) chloride',
    formula: 'CuCl₂(aq)',
    liquidColor: 'rgba(6, 182, 212, 0.45)',
    cathodeType: 'copper',
    cathodeProduct: 'Copper (Cu)',
    cathodeObs: 'Pink-brown solid copper coating forms on cathode',
    anodeType: 'chlorine',
    anodeProduct: 'Chlorine (Cl₂)',
    anodeObs: 'Pale green/colourless gas bubbles with sharp swimming-pool smell',
    litmusResult: 'Anode test: Damp blue litmus turns red briefly then bleaches white → Cl₂ confirmed.',
    burningSplintResult: 'No squeaky pop at cathode (solid copper formed instead of H₂).',
    glowingSplintResult: 'Glowing splint does not relight at anode (chlorine, not oxygen).',
  },
  {
    id: 'nacl',
    name: 'Sodium chloride',
    formula: 'NaCl(aq)',
    liquidColor: 'rgba(226, 232, 240, 0.5)',
    cathodeType: 'hydrogen',
    cathodeProduct: 'Hydrogen (H₂)',
    cathodeObs: 'Rapid effervescence (colourless bubbles of H₂)',
    anodeType: 'chlorine',
    anodeProduct: 'Chlorine (Cl₂)',
    anodeObs: 'Colourless/pale green bubbles at anode',
    litmusResult: 'Anode test: Damp blue litmus bleaches white → Chlorine (Cl₂) confirmed.',
    burningSplintResult: 'Cathode test: Burning splint gives a squeaky pop → Hydrogen (H₂) confirmed.',
    glowingSplintResult: 'Glowing splint does not relight.',
  },
  {
    id: 'cuso4',
    name: 'Copper(II) sulfate',
    formula: 'CuSO₄(aq)',
    liquidColor: 'rgba(14, 165, 233, 0.52)',
    cathodeType: 'copper',
    cathodeProduct: 'Copper (Cu)',
    cathodeObs: 'Red-brown solid copper deposits on graphite cathode',
    anodeType: 'oxygen',
    anodeProduct: 'Oxygen (O₂)',
    anodeObs: 'Steady stream of colourless oxygen bubbles',
    litmusResult: 'Damp blue litmus shows no bleaching (no halide ion present).',
    burningSplintResult: 'No squeaky pop at cathode (copper is less reactive than hydrogen).',
    glowingSplintResult: 'Anode test: Glowing splint relights brightly → Oxygen (O₂) confirmed.',
  },
  {
    id: 'na2so4',
    name: 'Sodium sulfate',
    formula: 'Na₂SO₄(aq)',
    liquidColor: 'rgba(226, 232, 240, 0.5)',
    cathodeType: 'hydrogen',
    cathodeProduct: 'Hydrogen (H₂)',
    cathodeObs: 'Vigorous colourless bubbles (2× volume of anode gas)',
    anodeType: 'oxygen',
    anodeProduct: 'Oxygen (O₂)',
    anodeObs: 'Colourless bubbles of oxygen gas',
    litmusResult: 'Damp blue litmus remains unchanged (no chlorine gas).',
    burningSplintResult: 'Cathode test: Burning splint gives a squeaky pop → Hydrogen (H₂) confirmed.',
    glowingSplintResult: 'Anode test: Glowing splint relights brightly → Oxygen (O₂) confirmed.',
  },
];

export const Practical3Electrolysis: React.FC<Props> = ({
  onSelectPractical,
  onBackToDirectory,
}) => {
  const { state, upsertElectrolysisRecord, completeStep } = useLab();
  const [selectedId, setSelectedId] = useState<string>('cucl2');
  const [powerOn, setPowerOn] = useState(false);
  const [voltage, setVoltage] = useState(4.5);
  const [activeGasTest, setActiveGasTest] = useState<'none' | 'litmus' | 'burning' | 'glowing'>('none');
  const [feedback, setFeedback] = useState(
    'Select an aqueous electrolyte, then switch on the 4–6 V DC power supply to observe both inert graphite electrodes.'
  );

  const current = ELECTROLYTES.find((e) => e.id === selectedId) ?? ELECTROLYTES[0];

  const handleSelectSolution = (id: string) => {
    setSelectedId(id);
    setPowerOn(false);
    setActiveGasTest('none');
    completeStep('p3-electrolysis', 'select-solution');
    const spec = ELECTROLYTES.find((e) => e.id === id)!;
    setFeedback(`Poured 50 cm³ of ${spec.name} (${spec.formula}) into the cell. Switch on the DC supply.`);
  };

  const handleTogglePower = () => {
    const next = !powerOn;
    setPowerOn(next);
    setActiveGasTest('none');
    if (next) {
      completeStep('p3-electrolysis', 'power-on');
      setFeedback(
        `DC supply active (${voltage.toFixed(1)} V). Cathode (−): ${current.cathodeObs}. Anode (+): ${current.anodeObs}. Now test the gases produced.`
      );
    } else {
      setFeedback('DC power supply switched off. Safe to change electrolyte solution.');
    }
  };

  const handleGasTest = (test: 'litmus' | 'burning' | 'glowing') => {
    if (!powerOn) {
      setFeedback('Switch on the DC power supply so products form before running gas tests.');
      return;
    }
    setActiveGasTest(test);
    completeStep('p3-electrolysis', 'test-gases');
    if (test === 'litmus') setFeedback(current.litmusResult);
    if (test === 'burning') setFeedback(current.burningSplintResult);
    if (test === 'glowing') setFeedback(current.glowingSplintResult);
  };

  const handleRecordObservation = () => {
    if (!powerOn) {
      setFeedback('Switch on electrolysis and observe the electrodes before logging this solution.');
      return;
    }
    const testSummary =
      activeGasTest === 'litmus'
        ? current.litmusResult
        : activeGasTest === 'burning'
        ? current.burningSplintResult
        : activeGasTest === 'glowing'
        ? current.glowingSplintResult
        : 'Visual electrode observation';

    upsertElectrolysisRecord({
      solutionId: current.id,
      solutionName: `${current.name} (${current.formula})`,
      cathodeObs: current.cathodeObs,
      cathodeProduct: current.cathodeProduct,
      anodeObs: current.anodeObs,
      anodeProduct: current.anodeProduct,
      gasTestUsed: testSummary,
    });

    const uniqueCount = new Set([...state.electrolysisRecords.map((r) => r.solutionId), current.id]).size;
    if (uniqueCount >= 4) {
      completeStep('p3-electrolysis', 'test-all-four');
    }
    setFeedback(
      `Recorded results for ${current.name} (${uniqueCount}/4 solutions logged). Switch off and test another electrolyte.`
    );
  };

  const resetLocal = () => {
    setSelectedId('cucl2');
    setPowerOn(false);
    setActiveGasTest('none');
    setFeedback('Electrolysis cell reset. Choose a solution and switch on the DC power supply.');
  };

  const dataPanel = (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold text-slate-900">Aqueous Electrolysis Matrix</h3>
        <span className="text-xs font-mono tabular-nums text-slate-500">
          {state.electrolysisRecords.length}/4 logged
        </span>
      </div>
      {state.electrolysisRecords.length === 0 ? (
        <p className="text-xs text-slate-500">
          Electrolyse each aqueous solution, run the appropriate gas test, and click "Log Solution Result".
        </p>
      ) : (
        <div className="space-y-2.5">
          {state.electrolysisRecords.map((rec) => (
            <div
              key={rec.solutionId}
              className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1"
            >
              <p className="font-semibold text-slate-900">{rec.solutionName}</p>
              <p className="text-slate-700">
                <span className="text-slate-500">Cathode (−):</span> {rec.cathodeProduct}
              </p>
              <p className="text-slate-700">
                <span className="text-slate-500">Anode (+):</span> {rec.anodeProduct}
              </p>
              <p className="text-slate-600">{rec.gasTestUsed}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <WorkbenchShell
      practicalId="p3-electrolysis"
      onSelectPractical={onSelectPractical}
      onBackToDirectory={onBackToDirectory}
      dataPanel={dataPanel}
      onResetLocal={resetLocal}
    >
      {/* Solution & Voltage Selector Bar */}
      <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1 p-1 bg-slate-200/70 rounded-lg overflow-x-auto">
          {ELECTROLYTES.map((el) => (
            <button
              key={el.id}
              type="button"
              onClick={() => handleSelectSolution(el.id)}
              className={`px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                selectedId === el.id
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {el.formula}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 text-xs">
          <label htmlFor="dc-voltage" className="text-slate-600 whitespace-nowrap">
            DC Supply: <span className="font-mono font-semibold text-slate-900">{voltage.toFixed(1)} V</span>
          </label>
          <input
            id="dc-voltage"
            type="range"
            min={4}
            max={6}
            step={0.5}
            value={voltage}
            onChange={(e) => setVoltage(parseFloat(e.target.value))}
            className="w-24 accent-blue-700 cursor-pointer"
          />
        </div>
      </div>

      {/* Interactive SVG Electrolysis Cell */}
      <div className="p-6 bg-gradient-to-b from-slate-50/70 to-white">
        <div className="w-full aspect-[16/9] max-h-[400px] bg-white border border-slate-200 rounded-xl relative overflow-hidden">
          <svg
            viewBox="0 0 720 380"
            className="w-full h-full"
            role="img"
            aria-label={`Electrolysis apparatus with ${current.name}`}
          >
            {/* Bench */}
            <rect x="0" y="330" width="720" height="50" fill="#f1f5f9" />
            <line x1="0" y1="330" x2="720" y2="330" stroke="#cbd5e1" strokeWidth="1.5" />

            {/* DC Power Supply Box (Left) */}
            <rect x="46" y="185" width="160" height="145" rx="8" fill="#1e293b" stroke="#0f172a" strokeWidth="2" />
            <text x="64" y="210" fontSize="11" fill="#94a3b8" fontFamily="DM Sans">
              DC Power Pack
            </text>
            <rect x="64" y="222" width="124" height="36" rx="4" fill="#0f172a" />
            <text
              x="126"
              y="246"
              textAnchor="middle"
              fontSize="16"
              fontWeight="600"
              fill={powerOn ? '#38bdf8' : '#64748b'}
              fontFamily="IBM Plex Mono"
            >
              {powerOn ? `${voltage.toFixed(1)} V · 0.62 A` : '0.0 V · OFF'}
            </text>
            {/* Terminals */}
            <circle cx="88" cy="296" r="10" fill="#0f172a" stroke="#94a3b8" strokeWidth="2" />
            <text x="88" y="300" textAnchor="middle" fontSize="13" fontWeight="700" fill="#f8fafc">
              −
            </text>
            <circle cx="164" cy="296" r="10" fill="#dc2626" stroke="#fca5a5" strokeWidth="2" />
            <text x="164" y="300" textAnchor="middle" fontSize="13" fontWeight="700" fill="#ffffff">
              +
            </text>

            {/* Connecting wires to Cathode (−) and Anode (+) */}
            <path
              d="M88 286 C88 90, 365 72, 365 112"
              fill="none"
              stroke="#1e293b"
              strokeWidth="3"
            />
            <path
              d="M164 286 C164 115, 495 85, 495 112"
              fill="none"
              stroke="#dc2626"
              strokeWidth="3"
            />

            {/* Electrolysis Glass Beaker */}
            <path
              d="M290 155 L290 322 Q290 330 298 330 L562 330 Q570 330 570 322 L570 155"
              fill="#ffffff"
              stroke="#64748b"
              strokeWidth="2.5"
            />
            {/* Aqueous electrolyte solution */}
            <path
              d="M292 200 L568 200 L568 322 Q568 328 562 328 L298 328 Q292 328 292 322 Z"
              fill={current.liquidColor}
            />
            {/* Wooden/plastic electrode holder bar */}
            <rect x="282" y="148" width="296" height="10" rx="2" fill="#cbd5e1" stroke="#94a3b8" />

            {/* Cathode (−) Graphite Rod */}
            <rect x="357" y="112" width="16" height="186" rx="3" fill="#334155" />
            {/* Pink-brown Copper deposit on cathode if Cu2+ */}
            {powerOn && current.cathodeType === 'copper' && (
              <rect x="355" y="200" width="20" height="98" rx="3" fill="#c2410c" opacity="0.88" />
            )}
            <text x="365" y="102" textAnchor="middle" fontSize="11" fontWeight="600" fill="#0f172a" fontFamily="DM Sans">
              Cathode (−)
            </text>

            {/* Anode (+) Graphite Rod */}
            <rect x="487" y="112" width="16" height="186" rx="3" fill="#334155" />
            <text x="495" y="102" textAnchor="middle" fontSize="11" fontWeight="600" fill="#b91c1c" fontFamily="DM Sans">
              Anode (+)
            </text>

            {/* Cathode Hydrogen Bubbles */}
            {powerOn && current.cathodeType === 'hydrogen' && (
              <g fill="#ffffff" stroke="#64748b" strokeWidth="1">
                <circle cx="352" cy="272" r="3.5" className="animate-bubble" />
                <circle cx="378" cy="256" r="4" className="animate-bubble" style={{ animationDelay: '0.4s' }} />
                <circle cx="350" cy="240" r="3" className="animate-bubble" style={{ animationDelay: '0.8s' }} />
                <circle cx="379" cy="285" r="3.5" className="animate-bubble" style={{ animationDelay: '1.1s' }} />
              </g>
            )}

            {/* Anode Chlorine or Oxygen Bubbles */}
            {powerOn && (
              <g
                fill={current.anodeType === 'chlorine' ? '#ecfccb' : '#ffffff'}
                stroke={current.anodeType === 'chlorine' ? '#65a30d' : '#64748b'}
                strokeWidth="1"
              >
                <circle cx="482" cy="270" r="3.5" className="animate-bubble" />
                <circle cx="508" cy="252" r="4" className="animate-bubble" style={{ animationDelay: '0.5s' }} />
                <circle cx="480" cy="236" r="3" className="animate-bubble" style={{ animationDelay: '0.9s' }} />
              </g>
            )}

            {/* Active Gas Test Visual Indicator */}
            {activeGasTest === 'litmus' && (
              <g transform="translate(514, 152)">
                <rect
                  x="0"
                  y="0"
                  width="18"
                  height="46"
                  rx="2"
                  fill={current.anodeType === 'chlorine' ? '#f8fafc' : '#3b82f6'}
                  stroke="#475569"
                  strokeWidth="1.2"
                />
                <text x="26" y="28" fontSize="11" fontWeight="600" fill="#0f172a" fontFamily="DM Sans">
                  {current.anodeType === 'chlorine' ? 'Bleached White!' : 'Remains Blue'}
                </text>
              </g>
            )}

            {activeGasTest === 'burning' && (
              <g transform="translate(310, 160)">
                <line x1="0" y1="0" x2="36" y2="28" stroke="#92400e" strokeWidth="4" strokeLinecap="round" />
                <circle
                  cx="40"
                  cy="31"
                  r={current.cathodeType === 'hydrogen' ? 14 : 6}
                  fill={current.cathodeType === 'hydrogen' ? '#f97316' : '#f59e0b'}
                  opacity="0.85"
                />
                <text x="-50" y="-8" fontSize="11" fontWeight="600" fill="#c2410c" fontFamily="DM Sans">
                  {current.cathodeType === 'hydrogen' ? 'Squeaky Pop!' : 'No Pop'}
                </text>
              </g>
            )}

            {activeGasTest === 'glowing' && (
              <g transform="translate(515, 160)">
                <line x1="40" y1="0" x2="4" y2="28" stroke="#92400e" strokeWidth="4" strokeLinecap="round" />
                <circle
                  cx="2"
                  cy="30"
                  r={current.anodeType === 'oxygen' ? 12 : 4}
                  fill={current.anodeType === 'oxygen' ? '#f59e0b' : '#ef4444'}
                />
                <text x="48" y="18" fontSize="11" fontWeight="600" fill="#b45309" fontFamily="DM Sans">
                  {current.anodeType === 'oxygen' ? 'Relights!' : 'Stays Dim'}
                </text>
              </g>
            )}

            <text x="430" y="356" textAnchor="middle" fontSize="11" fill="#475569" fontFamily="DM Sans">
              Electrolyte: {current.name} · {current.formula}
            </text>
          </svg>
        </div>

        {/* Bench Observation Strip */}
        <div className="mt-4 px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 leading-relaxed">
          <span className="font-semibold text-slate-900 mr-1.5">Cell observation:</span>
          {feedback}
        </div>

        {/* Power & Gas Test Controls */}
        <div className="mt-4 flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handleTogglePower}
            className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
              powerOn
                ? 'bg-rose-600 text-white hover:bg-rose-700'
                : 'bg-blue-700 text-white hover:bg-blue-800'
            }`}
          >
            <Power className="w-3.5 h-3.5" aria-hidden="true" />
            {powerOn ? 'Switch Off DC Supply' : 'Switch On DC Supply'}
          </button>

          <button
            type="button"
            onClick={() => handleGasTest('litmus')}
            disabled={!powerOn}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-800 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg whitespace-nowrap cursor-pointer disabled:opacity-40"
          >
            <FileText className="w-3.5 h-3.5 text-blue-600" aria-hidden="true" />
            Damp Blue Litmus (Cl₂)
          </button>

          <button
            type="button"
            onClick={() => handleGasTest('burning')}
            disabled={!powerOn}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-800 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg whitespace-nowrap cursor-pointer disabled:opacity-40"
          >
            <Flame className="w-3.5 h-3.5 text-amber-600" aria-hidden="true" />
            Burning Splint (H₂)
          </button>

          <button
            type="button"
            onClick={() => handleGasTest('glowing')}
            disabled={!powerOn}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-800 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg whitespace-nowrap cursor-pointer disabled:opacity-40"
          >
            <Flame className="w-3.5 h-3.5 text-rose-500" aria-hidden="true" />
            Glowing Splint (O₂)
          </button>

          <button
            type="button"
            onClick={handleRecordObservation}
            disabled={!powerOn}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg whitespace-nowrap cursor-pointer disabled:opacity-40 ml-auto"
          >
            <Check className="w-3.5 h-3.5" aria-hidden="true" />
            Log Solution Result
          </button>
        </div>
      </div>
    </WorkbenchShell>
  );
};
