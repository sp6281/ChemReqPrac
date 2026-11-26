import React, { useState } from 'react';
import { Flame, TestTube2, Check } from 'lucide-react';
import { WorkbenchShell } from '../WorkbenchShell';
import { PracticalId } from '../../types/lab';
import { useLab } from '../../context/LabContext';

interface Props {
  onSelectPractical: (id: PracticalId) => void;
  onBackToDirectory: () => void;
}

interface SaltSample {
  id: string;
  label: string;
  isMystery: boolean;
  trueName: string;
  cation: string;
  anion: string;
  flameColorHex: string | null;
  flameDesc: string;
  naohColorHex: string | null;
  naohDesc: string;
  dissolvesInExcessNaoh: boolean;
  carbonateEffervescence: boolean;
  sulfateWhitePpt: boolean;
  halidePptColor: 'none' | 'white' | 'cream' | 'yellow';
  halideDesc: string;
}

const SAMPLES: SaltSample[] = [
  {
    id: 'ref-li',
    label: 'Ref: LiCl',
    isMystery: false,
    trueName: 'Lithium chloride',
    cation: 'Li⁺',
    anion: 'Cl⁻',
    flameColorHex: '#dc2626',
    flameDesc: 'Crimson red flame (Li⁺)',
    naohColorHex: null,
    naohDesc: 'No precipitate formed',
    dissolvesInExcessNaoh: false,
    carbonateEffervescence: false,
    sulfateWhitePpt: false,
    halidePptColor: 'white',
    halideDesc: 'White precipitate of AgCl (Cl⁻)',
  },
  {
    id: 'ref-cu',
    label: 'Ref: CuSO₄',
    isMystery: false,
    trueName: 'Copper(II) sulfate',
    cation: 'Cu²⁺',
    anion: 'SO₄²⁻',
    flameColorHex: '#16a34a',
    flameDesc: 'Green flame (Cu²⁺)',
    naohColorHex: '#2563eb',
    naohDesc: 'Blue precipitate of Cu(OH)₂',
    dissolvesInExcessNaoh: false,
    carbonateEffervescence: false,
    sulfateWhitePpt: true,
    halidePptColor: 'none',
    halideDesc: 'No precipitate with AgNO₃',
  },
  {
    id: 'ref-fe3',
    label: 'Ref: FeCl₃',
    isMystery: false,
    trueName: 'Iron(III) chloride',
    cation: 'Fe³⁺',
    anion: 'Cl⁻',
    flameColorHex: null,
    flameDesc: 'No characteristic flame colour',
    naohColorHex: '#92400e',
    naohDesc: 'Red-brown precipitate of Fe(OH)₃',
    dissolvesInExcessNaoh: false,
    carbonateEffervescence: false,
    sulfateWhitePpt: false,
    halidePptColor: 'white',
    halideDesc: 'White precipitate of AgCl (Cl⁻)',
  },
  {
    id: 'ref-al',
    label: 'Ref: Al₂(SO₄)₃',
    isMystery: false,
    trueName: 'Aluminium sulfate',
    cation: 'Al³⁺',
    anion: 'SO₄²⁻',
    flameColorHex: null,
    flameDesc: 'No characteristic flame colour',
    naohColorHex: '#f8fafc',
    naohDesc: 'White precipitate (redissolves in excess NaOH!)',
    dissolvesInExcessNaoh: true,
    carbonateEffervescence: false,
    sulfateWhitePpt: true,
    halidePptColor: 'none',
    halideDesc: 'No precipitate with AgNO₃',
  },
  {
    id: 'mystery-x',
    label: 'Mystery X',
    isMystery: true,
    trueName: 'Potassium bromide',
    cation: 'K⁺',
    anion: 'Br⁻',
    flameColorHex: '#a855f7',
    flameDesc: 'Lilac flame',
    naohColorHex: null,
    naohDesc: 'No precipitate formed',
    dissolvesInExcessNaoh: false,
    carbonateEffervescence: false,
    sulfateWhitePpt: false,
    halidePptColor: 'cream',
    halideDesc: 'Cream precipitate formed with HNO₃ + AgNO₃',
  },
  {
    id: 'mystery-y',
    label: 'Mystery Y',
    isMystery: true,
    trueName: 'Iron(II) sulfate',
    cation: 'Fe²⁺',
    anion: 'SO₄²⁻',
    flameColorHex: null,
    flameDesc: 'No distinct flame colour',
    naohColorHex: '#15803d',
    naohDesc: 'Dirty green precipitate (insoluble in excess)',
    dissolvesInExcessNaoh: false,
    carbonateEffervescence: false,
    sulfateWhitePpt: true,
    halidePptColor: 'none',
    halideDesc: 'No precipitate with AgNO₃',
  },
  {
    id: 'mystery-z',
    label: 'Mystery Z',
    isMystery: true,
    trueName: 'Sodium carbonate',
    cation: 'Na⁺',
    anion: 'CO₃²⁻',
    flameColorHex: '#eab308',
    flameDesc: 'Bright yellow flame',
    naohColorHex: null,
    naohDesc: 'No precipitate formed',
    dissolvesInExcessNaoh: false,
    carbonateEffervescence: true,
    sulfateWhitePpt: false,
    halidePptColor: 'none',
    halideDesc: 'No halide precipitate',
  },
];

const CATION_OPTIONS = ['Li⁺', 'Na⁺', 'K⁺', 'Ca²⁺', 'Cu²⁺', 'Fe²⁺', 'Fe³⁺', 'Al³⁺', 'Mg²⁺'];
const ANION_OPTIONS = ['CO₃²⁻', 'SO₄²⁻', 'Cl⁻', 'Br⁻', 'I⁻'];

export const Practical7Ions: React.FC<Props> = ({
  onSelectPractical,
  onBackToDirectory,
}) => {
  const { state, upsertIonRecord, completeStep } = useLab();

  const [station, setStation] = useState<'flame' | 'naoh' | 'anion'>('flame');
  const [sampleId, setSampleId] = useState<string>('mystery-x');
  const [wireCleaned, setWireCleaned] = useState(false);
  const [flameActive, setFlameActive] = useState(false);
  const [naohState, setNaohState] = useState<'none' | 'few-drops' | 'excess'>('none');
  const [anionTest, setAnionTest] = useState<'none' | 'carbonate' | 'sulfate' | 'halide'>('none');
  const [guessCation, setGuessCation] = useState('K⁺');
  const [guessAnion, setGuessAnion] = useState('Br⁻');
  const [verifyMsg, setVerifyMsg] = useState<string | null>(null);
  const [feedback, setFeedback] = useState(
    'Select a reference salt or Mystery Sample (X, Y, Z), then test it across the Flame, NaOH, and Anion benches.'
  );

  const sample = SAMPLES.find((s) => s.id === sampleId) ?? SAMPLES[4];

  const handleSelectSample = (id: string) => {
    setSampleId(id);
    setWireCleaned(false);
    setFlameActive(false);
    setNaohState('none');
    setAnionTest('none');
    setVerifyMsg(null);
    const s = SAMPLES.find((x) => x.id === id)!;
    setFeedback(`Loaded ${s.label} onto the analytical bench. Clean the nichrome wire or choose a wet chemical test.`);
  };

  const handleCleanWire = () => {
    setWireCleaned(true);
    setFlameActive(false);
    setFeedback('Nichrome loop dipped in concentrated HCl and flamed until no residual colour remains.');
  };

  const handleRunFlame = () => {
    if (!wireCleaned) {
      setFeedback('Technique reminder: Clean the nichrome wire in HCl and flame it first to avoid sodium contamination!');
      return;
    }
    setFlameActive(true);
    completeStep('p7-ions', 'flame-test');
    const existing = state.ionRecords.find((r) => r.sampleId === sample.id);
    upsertIonRecord({
      sampleId: sample.id,
      sampleLabel: sample.label,
      flameResult: sample.flameDesc,
      naohResult: existing?.naohResult ?? '',
      anionTest: existing?.anionTest ?? '',
      anionResult: existing?.anionResult ?? '',
      studentIdentification: existing?.studentIdentification ?? '',
      verified: existing?.verified,
    });
    setFeedback(`Flame test observation for ${sample.label}: ${sample.flameDesc}.`);
  };

  const handleNaoh = (level: 'few-drops' | 'excess') => {
    setNaohState(level);
    completeStep('p7-ions', 'naoh-test');
    const obs =
      level === 'excess' && sample.dissolvesInExcessNaoh
        ? 'White precipitate redissolved in excess NaOH → colourless solution (Al³⁺ confirmed!)'
        : sample.naohDesc;
    const existing = state.ionRecords.find((r) => r.sampleId === sample.id);
    upsertIonRecord({
      sampleId: sample.id,
      sampleLabel: sample.label,
      flameResult: existing?.flameResult ?? '',
      naohResult: obs,
      anionTest: existing?.anionTest ?? '',
      anionResult: existing?.anionResult ?? '',
      studentIdentification: existing?.studentIdentification ?? '',
      verified: existing?.verified,
    });
    setFeedback(`NaOH test (${level === 'few-drops' ? 'few drops' : 'excess'}) for ${sample.label}: ${obs}.`);
  };

  const handleAnion = (test: 'carbonate' | 'sulfate' | 'halide') => {
    setAnionTest(test);
    completeStep('p7-ions', 'anion-tests');
    let obs = '';
    if (test === 'carbonate') {
      obs = sample.carbonateEffervescence
        ? 'Rapid effervescence; gas bubbled into limewater turns it cloudy/milky → CO₃²⁻ present!'
        : 'No effervescence observed; limewater remains clear.';
    } else if (test === 'sulfate') {
      obs = sample.sulfateWhitePpt
        ? 'Acidified with dilute HCl + BaCl₂(aq) → dense white precipitate of BaSO₄ → SO₄²⁻ present!'
        : 'Solution remains clear (no sulfate precipitate).';
    } else {
      obs = sample.halideDesc;
    }

    const existing = state.ionRecords.find((r) => r.sampleId === sample.id);
    upsertIonRecord({
      sampleId: sample.id,
      sampleLabel: sample.label,
      flameResult: existing?.flameResult ?? '',
      naohResult: existing?.naohResult ?? '',
      anionTest: test,
      anionResult: obs,
      studentIdentification: existing?.studentIdentification ?? '',
      verified: existing?.verified,
    });
    setFeedback(`Anion test (${test}) for ${sample.label}: ${obs}`);
  };

  const handleSubmitMystery = () => {
    if (!sample.isMystery) return;
    const isCorrect = guessCation === sample.cation && guessAnion === sample.anion;
    const existing = state.ionRecords.find((r) => r.sampleId === sample.id);
    upsertIonRecord({
      sampleId: sample.id,
      sampleLabel: sample.label,
      flameResult: existing?.flameResult ?? sample.flameDesc,
      naohResult: existing?.naohResult ?? '',
      anionTest: existing?.anionTest ?? '',
      anionResult: existing?.anionResult ?? '',
      studentIdentification: isCorrect
        ? `${sample.trueName} (${sample.cation}, ${sample.anion})`
        : `${guessCation} + ${guessAnion} (incorrect)`,
      verified: isCorrect,
    });
    if (isCorrect) {
      completeStep('p7-ions', 'solve-mystery');
      setVerifyMsg(`Verified! ${sample.label} is indeed ${sample.trueName} (${sample.cation} and ${sample.anion}).`);
    } else {
      setVerifyMsg(
        `Not quite — re-check your flame, NaOH, and anion test results for ${sample.label} against the Reference table.`
      );
    }
  };

  const resetLocal = () => {
    setWireCleaned(false);
    setFlameActive(false);
    setNaohState('none');
    setAnionTest('none');
    setVerifyMsg(null);
  };

  const halideFill =
    sample.halidePptColor === 'white'
      ? '#f8fafc'
      : sample.halidePptColor === 'cream'
      ? '#fef3c7'
      : sample.halidePptColor === 'yellow'
      ? '#fde047'
      : 'transparent';

  const dataPanel = (
    <div className="space-y-4">
      <h3 className="text-xs font-semibold text-slate-900">Logged Qualitative Tests</h3>
      {state.ionRecords.length === 0 ? (
        <p className="text-xs text-slate-500">
          Run flame, NaOH, and anion tests on reference salts and mystery samples X, Y, Z.
        </p>
      ) : (
        <div className="space-y-2.5">
          {state.ionRecords.map((r) => (
            <div key={r.sampleId} className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1">
              <div className="flex justify-between font-semibold text-slate-900">
                <span>{r.sampleLabel}</span>
                {r.verified && <span className="text-emerald-700">Verified</span>}
              </div>
              {r.flameResult && <p className="text-slate-600">Flame: {r.flameResult}</p>}
              {r.naohResult && <p className="text-slate-600">NaOH: {r.naohResult}</p>}
              {r.anionResult && <p className="text-slate-600">Anion: {r.anionResult}</p>}
              {r.studentIdentification && (
                <p className="font-medium text-blue-800 pt-1">ID: {r.studentIdentification}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {sample.isMystery && (
        <div className="p-3 bg-blue-50/60 border border-blue-200 rounded-lg space-y-2.5 text-xs">
          <p className="font-semibold text-slate-900">Submit Identification for {sample.label}</p>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label htmlFor="guess-cation" className="block text-[11px] text-slate-600 mb-1">
                Cation (+)
              </label>
              <select
                id="guess-cation"
                value={guessCation}
                onChange={(e) => setGuessCation(e.target.value)}
                className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded-md font-mono"
              >
                {CATION_OPTIONS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="guess-anion" className="block text-[11px] text-slate-600 mb-1">
                Anion (−)
              </label>
              <select
                id="guess-anion"
                value={guessAnion}
                onChange={(e) => setGuessAnion(e.target.value)}
                className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded-md font-mono"
              >
                {ANION_OPTIONS.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <button
            type="button"
            onClick={handleSubmitMystery}
            className="w-full py-1.5 text-xs font-medium text-white bg-blue-700 hover:bg-blue-800 rounded-md cursor-pointer"
          >
            Verify {sample.label} Identity
          </button>
          {verifyMsg && <p className="text-slate-800 leading-relaxed">{verifyMsg}</p>}
        </div>
      )}
    </div>
  );

  return (
    <WorkbenchShell
      practicalId="p7-ions"
      onSelectPractical={onSelectPractical}
      onBackToDirectory={onBackToDirectory}
      dataPanel={dataPanel}
      onResetLocal={resetLocal}
    >
      {/* Sample Selector & Station Switcher */}
      <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1 p-1 bg-slate-200/70 rounded-lg">
            {(
              [
                { id: 'flame', label: '1. Flame Test' },
                { id: 'naoh', label: '2. NaOH Precipitate' },
                { id: 'anion', label: '3. Anion Tests' },
              ] as const
            ).map((st) => (
              <button
                key={st.id}
                type="button"
                onClick={() => setStation(st.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                  station === st.id
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>

          <span className="text-xs font-mono text-slate-600">
            Active Sample: <strong className="text-slate-900">{sample.label}</strong>
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {SAMPLES.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => handleSelectSample(s.id)}
              className={`px-2.5 py-1 text-xs font-medium rounded-md border transition-colors whitespace-nowrap cursor-pointer ${
                sampleId === s.id
                  ? s.isMystery
                    ? 'bg-blue-700 text-white border-blue-700'
                    : 'bg-slate-900 text-white border-slate-900'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Interactive Analytical Station SVG */}
      <div className="p-6 bg-gradient-to-b from-slate-50/70 to-white space-y-4">
        <div className="w-full aspect-[16/9] max-h-[380px] bg-white border border-slate-200 rounded-xl overflow-hidden">
          <svg
            viewBox="0 0 720 360"
            className="w-full h-full"
            role="img"
            aria-label={`Ion identification ${station} station for ${sample.label}`}
          >
            <rect x="0" y="315" width="720" height="45" fill="#f1f5f9" />
            <line x1="0" y1="315" x2="720" y2="315" stroke="#cbd5e1" strokeWidth="1.5" />

            {station === 'flame' && (
              <g>
                {/* Dark viewing backdrop panel behind Bunsen so flame colour pops cleanly */}
                <rect x="200" y="32" width="320" height="270" rx="10" fill="#0f172a" />
                {/* Bunsen base & chimney */}
                <rect x="320" y="294" width="80" height="14" rx="2" fill="#475569" />
                <rect x="350" y="206" width="20" height="88" fill="#94a3b8" />
                <rect x="346" y="255" width="28" height="14" rx="2" fill="#64748b" />

                {/* Roaring blue flame + active cation colour */}
                <g className="animate-flame">
                  <path
                    d="M360 98 C388 144, 384 198, 360 206 C336 198, 332 144, 360 98 Z"
                    fill={flameActive && sample.flameColorHex ? sample.flameColorHex : '#3b82f6'}
                    opacity="0.88"
                  />
                  <path
                    d="M360 138 C372 166, 370 198, 360 206 C350 198, 348 166, 360 138 Z"
                    fill="#bfdbfe"
                    opacity="0.7"
                  />
                </g>

                {/* Nichrome wire loop */}
                <line
                  x1={flameActive ? 364 : 445}
                  y1="158"
                  x2={flameActive ? 470 : 540}
                  y2="215"
                  stroke="#cbd5e1"
                  strokeWidth="2.5"
                />
                <circle
                  cx={flameActive ? 360 : 440}
                  cy="155"
                  r="5.5"
                  fill="none"
                  stroke="#e2e8f0"
                  strokeWidth="2"
                />

                <text x="360" y="64" textAnchor="middle" fontSize="13" fontWeight="600" fill="#f8fafc" fontFamily="Plus Jakarta Sans">
                  {flameActive ? sample.flameDesc : 'Roaring Blue Flame (Air Hole Open)'}
                </text>
                <text x="360" y="340" textAnchor="middle" fontSize="11" fill="#475569" fontFamily="DM Sans">
                  Nichrome loop status: {wireCleaned ? 'Cleaned in conc. HCl' : 'Needs HCl cleaning'}
                </text>
              </g>
            )}

            {station === 'naoh' && (
              <g>
                {/* Test tube rack */}
                <rect x="275" y="295" width="170" height="18" rx="3" fill="#b45309" opacity="0.75" />
                {/* Test tube */}
                <path
                  d="M336 86 L336 270 Q336 294 360 294 Q384 294 384 270 L384 86"
                  fill="#ffffff"
                  stroke="#64748b"
                  strokeWidth="2.5"
                />
                {/* Sample solution */}
                <path
                  d="M338 175 L382 175 L382 270 Q382 292 360 292 Q338 292 338 270 Z"
                  fill={sample.cation === 'Cu²⁺' ? 'rgba(14,165,233,0.35)' : 'rgba(226,232,240,0.55)'}
                />
                {/* Precipitate cloud */}
                {naohState !== 'none' &&
                  sample.naohColorHex &&
                  !(naohState === 'excess' && sample.dissolvesInExcessNaoh) && (
                    <path
                      d="M340 225 Q360 212 380 225 L380 272 Q380 290 360 290 Q340 290 340 272 Z"
                      fill={sample.naohColorHex}
                      stroke="#94a3b8"
                      strokeWidth={sample.naohColorHex === '#f8fafc' ? 1.5 : 0}
                      opacity="0.92"
                    />
                  )}
                <text x="360" y="56" textAnchor="middle" fontSize="13" fontWeight="600" fill="#0f172a" fontFamily="Plus Jakarta Sans">
                  Sodium Hydroxide (NaOH) Precipitate Test — {sample.label}
                </text>
                <text x="360" y="340" textAnchor="middle" fontSize="11.5" fill="#334155" fontFamily="DM Sans">
                  {naohState === 'none'
                    ? 'Add a few drops of dilute NaOH(aq) to test for metal hydroxide precipitates'
                    : naohState === 'excess' && sample.dissolvesInExcessNaoh
                    ? 'White precipitate redissolved in excess NaOH → Al³⁺ confirmed'
                    : sample.naohDesc}
                </text>
              </g>
            )}

            {station === 'anion' && (
              <g>
                {/* Test Tube 1: Sample + Reagent */}
                <path
                  d="M236 105 L236 270 Q236 292 260 292 Q284 292 284 270 L284 105"
                  fill="#ffffff"
                  stroke="#64748b"
                  strokeWidth="2.5"
                />
                <path
                  d="M238 190 L282 190 L282 270 Q282 290 260 290 Q238 290 238 270 Z"
                  fill="rgba(226,232,240,0.55)"
                />

                {/* Carbonate bubbles + delivery tube to limewater */}
                {anionTest === 'carbonate' && (
                  <>
                    <path
                      d="M260 105 L260 66 L440 66 L440 245"
                      fill="none"
                      stroke="#475569"
                      strokeWidth="3"
                    />
                    <path
                      d="M416 125 L416 270 Q416 292 440 292 Q464 292 464 270 L464 125"
                      fill="#ffffff"
                      stroke="#64748b"
                      strokeWidth="2.5"
                    />
                    <path
                      d="M418 205 L462 205 L462 270 Q462 290 440 290 Q418 290 418 270 Z"
                      fill={sample.carbonateEffervescence ? '#f1f5f9' : '#e0f2fe'}
                      opacity={sample.carbonateEffervescence ? 0.96 : 0.45}
                    />
                    {sample.carbonateEffervescence && (
                      <g fill="#ffffff" stroke="#64748b" strokeWidth="1">
                        <circle cx="255" cy="240" r="3.5" className="animate-bubble" />
                        <circle cx="268" cy="225" r="3" className="animate-bubble" style={{ animationDelay: '0.4s' }} />
                        <circle cx="440" cy="255" r="3.5" className="animate-bubble" />
                      </g>
                    )}
                    <text x="440" y="308" textAnchor="middle" fontSize="11" fill="#334155" fontFamily="DM Sans">
                      Limewater: {sample.carbonateEffervescence ? 'Cloudy Milky!' : 'Clear'}
                    </text>
                  </>
                )}

                {/* Sulfate white BaSO4 precipitate */}
                {anionTest === 'sulfate' && sample.sulfateWhitePpt && (
                  <path
                    d="M240 232 Q260 222 280 232 L280 272 Q280 289 260 289 Q240 289 240 272 Z"
                    fill="#ffffff"
                    stroke="#cbd5e1"
                    strokeWidth="1.5"
                  />
                )}

                {/* Halide AgX precipitate */}
                {anionTest === 'halide' && sample.halidePptColor !== 'none' && (
                  <path
                    d="M240 232 Q260 222 280 232 L280 272 Q280 289 260 289 Q240 289 240 272 Z"
                    fill={halideFill}
                    stroke="#cbd5e1"
                    strokeWidth="1.5"
                  />
                )}

                <text x="360" y="42" textAnchor="middle" fontSize="13" fontWeight="600" fill="#0f172a" fontFamily="Plus Jakarta Sans">
                  Anion Qualitative Tests — {sample.label}
                </text>
                <text x="260" y="308" textAnchor="middle" fontSize="11" fill="#334155" fontFamily="DM Sans">
                  Sample Tube
                </text>
              </g>
            )}
          </svg>
        </div>

        {/* Live Observation Strip */}
        <div className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 leading-relaxed">
          <span className="font-semibold text-slate-900 mr-1.5">Analytical result:</span>
          {feedback}
        </div>

        {/* Station-specific Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {station === 'flame' && (
            <>
              <button
                type="button"
                onClick={handleCleanWire}
                className="px-4 py-2 text-xs font-medium text-slate-800 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg cursor-pointer whitespace-nowrap"
              >
                1. Clean Wire in Conc. HCl
              </button>
              <button
                type="button"
                onClick={handleRunFlame}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-blue-700 hover:bg-blue-800 rounded-lg cursor-pointer whitespace-nowrap"
              >
                <Flame className="w-3.5 h-3.5" aria-hidden="true" />
                2. Dip in {sample.label} &amp; Hold in Flame
              </button>
            </>
          )}

          {station === 'naoh' && (
            <>
              <button
                type="button"
                onClick={() => handleNaoh('few-drops')}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-blue-700 hover:bg-blue-800 rounded-lg cursor-pointer whitespace-nowrap"
              >
                <TestTube2 className="w-3.5 h-3.5" aria-hidden="true" />
                Add Few Drops NaOH(aq)
              </button>
              <button
                type="button"
                onClick={() => handleNaoh('excess')}
                disabled={naohState === 'none'}
                className="px-4 py-2 text-xs font-medium text-slate-800 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg cursor-pointer whitespace-nowrap disabled:opacity-40"
              >
                Add Excess NaOH(aq)
              </button>
            </>
          )}

          {station === 'anion' && (
            <>
              <button
                type="button"
                onClick={() => handleAnion('carbonate')}
                className="px-3.5 py-2 text-xs font-medium text-white bg-blue-700 hover:bg-blue-800 rounded-lg cursor-pointer whitespace-nowrap"
              >
                Carbonate: Dilute Acid + Limewater
              </button>
              <button
                type="button"
                onClick={() => handleAnion('sulfate')}
                className="px-3.5 py-2 text-xs font-medium text-slate-800 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg cursor-pointer whitespace-nowrap"
              >
                Sulfate: Dilute HCl + BaCl₂
              </button>
              <button
                type="button"
                onClick={() => handleAnion('halide')}
                className="px-3.5 py-2 text-xs font-medium text-slate-800 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg cursor-pointer whitespace-nowrap"
              >
                Halide: Dilute HNO₃ + AgNO₃
              </button>
            </>
          )}

          {sample.isMystery && (
            <span className="inline-flex items-center gap-1 text-xs text-slate-500 ml-auto">
              <Check className="w-3.5 h-3.5 text-blue-700" aria-hidden="true" />
              Open the Data tab to submit your {sample.label} identity
            </span>
          )}
        </div>
      </div>
    </WorkbenchShell>
  );
};
