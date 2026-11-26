import React from 'react';

const AT_CODES = [
  { code: 'AT 1', desc: 'Use of appropriate apparatus to make and record a range of measurements accurately, including mass, time, temperature, and volume of liquids and gases.' },
  { code: 'AT 2', desc: 'Safe use of appropriate heating devices and techniques including use of a Bunsen burner and a water bath or electric heater.' },
  { code: 'AT 3', desc: 'Use of appropriate apparatus and techniques for conducting and monitoring chemical reactions, including appropriate reagents and/or techniques for the measurement of pH.' },
  { code: 'AT 4', desc: 'Safe use of a range of equipment to purify and/or separate chemical mixtures including evaporation, filtration, crystallisation, chromatography, and distillation.' },
  { code: 'AT 5', desc: 'Making and recording of appropriate observations during chemical reactions including changes in temperature and the measurement of rates of reaction.' },
  { code: 'AT 6', desc: 'Safe use and careful handling of gases, liquids and solids, including careful mixing of reagents under controlled conditions.' },
  { code: 'AT 7', desc: 'Use of appropriate apparatus and techniques to draw, set up and use electrochemical cells for separation and production of elements and compounds.' },
  { code: 'AT 8', desc: 'Use of appropriate qualitative reagents and techniques to analyse and identify unknown samples or products including gas tests, flame tests, and precipitation reactions.' },
];

const ION_CHART = [
  { test: 'Flame test — Li⁺', obs: 'Crimson red flame' },
  { test: 'Flame test — Na⁺', obs: 'Yellow flame' },
  { test: 'Flame test — K⁺', obs: 'Lilac flame' },
  { test: 'Flame test — Ca²⁺', obs: 'Orange-red flame' },
  { test: 'Flame test — Cu²⁺', obs: 'Green flame' },
  { test: 'NaOH(aq) — Cu²⁺', obs: 'Blue precipitate of Cu(OH)₂' },
  { test: 'NaOH(aq) — Fe²⁺', obs: 'Green precipitate of Fe(OH)₂' },
  { test: 'NaOH(aq) — Fe³⁺', obs: 'Brown precipitate of Fe(OH)₃' },
  { test: 'NaOH(aq) — Al³⁺', obs: 'White precipitate that dissolves in excess NaOH' },
  { test: 'NaOH(aq) — Ca²⁺ / Mg²⁺', obs: 'White precipitate (insoluble in excess NaOH)' },
  { test: 'Carbonate (CO₃²⁻)', obs: 'Dilute acid → effervescence; CO₂ turns limewater cloudy' },
  { test: 'Sulfate (SO₄²⁻)', obs: 'Dilute HCl + BaCl₂(aq) → white precipitate (BaSO₄)' },
  { test: 'Chloride (Cl⁻)', obs: 'Dilute HNO₃ + AgNO₃(aq) → white precipitate (AgCl)' },
  { test: 'Bromide (Br⁻)', obs: 'Dilute HNO₃ + AgNO₃(aq) → cream precipitate (AgBr)' },
  { test: 'Iodide (I⁻)', obs: 'Dilute HNO₃ + AgNO₃(aq) → yellow precipitate (AgI)' },
];

const GAS_TESTS = [
  { gas: 'Hydrogen (H₂)', method: 'Insert a burning wooden splint into the test tube', result: 'Burns rapidly with a squeaky pop' },
  { gas: 'Oxygen (O₂)', method: 'Insert a glowing wooden splint into the test tube', result: 'Glowing splint relights' },
  { gas: 'Carbon dioxide (CO₂)', method: 'Bubble the gas through aqueous calcium hydroxide (limewater)', result: 'Limewater turns milky / cloudy white' },
  { gas: 'Chlorine (Cl₂)', method: 'Hold damp blue litmus paper near the mouth of the tube', result: 'Litmus paper is bleached white (may briefly turn red first)' },
];

export const ReferenceView: React.FC = () => {
  return (
    <main className="max-w-[1200px] mx-auto px-6 py-10 space-y-10">
      <div className="border-b border-slate-200 pb-6">
        <p className="text-xs text-slate-500">AQA GCSE Chemistry (8462) Practical Handbook</p>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight mt-1">
          Laboratory Reference &amp; Formula Guide
        </h1>
        <p className="text-sm text-slate-600 mt-1 max-w-2xl">
          Key qualitative test results, quantitative equations, and Apparatus &amp; Techniques (AT 1–8) criteria assessed across Paper 1 and Paper 2.
        </p>
      </div>

      {/* Key Quantitative Equations */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-2">
          <h2 className="text-sm font-bold text-slate-900">Titration &amp; Concentration</h2>
          <p className="font-mono text-sm text-blue-800 bg-blue-50/70 rounded-lg px-3 py-2">
            n = c × V (dm³)
          </p>
          <p className="text-xs text-slate-600 leading-relaxed">
            Convert cm³ to dm³ by dividing by 1000. Only average concordant titres (within 0.10 cm³ of each other) and exclude the rough run.
          </p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-2">
          <h2 className="text-sm font-bold text-slate-900">Chromatography Rf Value</h2>
          <p className="font-mono text-sm text-blue-800 bg-blue-50/70 rounded-lg px-3 py-2">
            Rf = d(substance) ÷ d(solvent)
          </p>
          <p className="text-xs text-slate-600 leading-relaxed">
            Measure from the pencil baseline to the centre of each spot and to the solvent front. Rf is always dimensionless and between 0 and 1.
          </p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-2">
          <h2 className="text-sm font-bold text-slate-900">Mean Rate of Reaction</h2>
          <p className="font-mono text-sm text-blue-800 bg-blue-50/70 rounded-lg px-3 py-2">
            Rate = ΔVolume ÷ Δt  or  1 ÷ t
          </p>
          <p className="text-xs text-slate-600 leading-relaxed">
            For the disappearing cross, 1/t (in s⁻¹) is directly proportional to reaction rate. For gas syringe graphs, initial rate equals the gradient of the tangent at t = 0.
          </p>
        </div>
      </section>

      {/* Gas Tests */}
      <section className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
        <h2 className="text-lg font-bold text-slate-900">Standard Chemical Gas Tests</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-xs text-slate-500">
                <th className="py-2 pr-4 font-medium">Gas</th>
                <th className="py-2 pr-4 font-medium">Procedure</th>
                <th className="py-2 font-medium">Positive Observation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {GAS_TESTS.map((g) => (
                <tr key={g.gas}>
                  <td className="py-2.5 pr-4 font-mono font-medium text-slate-900 whitespace-nowrap">
                    {g.gas}
                  </td>
                  <td className="py-2.5 pr-4 text-slate-700">{g.method}</td>
                  <td className="py-2.5 text-slate-800 font-medium">{g.result}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Ion Identification Table */}
      <section className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
        <h2 className="text-lg font-bold text-slate-900">
          Qualitative Ion Analysis Reference (RP 7)
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 text-sm">
          {ION_CHART.map((row) => (
            <div
              key={row.test}
              className="flex items-baseline justify-between gap-4 py-2 border-b border-slate-100"
            >
              <span className="font-mono text-xs font-medium text-slate-900 shrink-0">
                {row.test}
              </span>
              <span className="text-xs text-slate-600 text-right">{row.obs}</span>
            </div>
          ))}
        </div>
      </section>

      {/* AT 1-8 Matrix */}
      <section className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
        <h2 className="text-lg font-bold text-slate-900">
          AQA Apparatus &amp; Techniques (AT 1–8)
        </h2>
        <div className="divide-y divide-slate-100">
          {AT_CODES.map((item) => (
            <div key={item.code} className="py-3 flex flex-col sm:flex-row gap-2 sm:gap-6">
              <span className="font-mono text-xs font-semibold text-blue-700 w-14 shrink-0 pt-0.5">
                {item.code}
              </span>
              <p className="text-sm text-slate-700 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
};
