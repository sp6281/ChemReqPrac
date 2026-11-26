import { PracticalMeta } from '../types/lab';

export const PRACTICALS: PracticalMeta[] = [
  {
    id: 'p1-salts',
    number: 1,
    title: 'Making Soluble Salts',
    shortTitle: 'Making Salts',
    aqaRef: '4.4.2.3 · RP 1',
    paper: 1,
    separateOnly: false,
    apparatusCodes: ['AT 2', 'AT 3', 'AT 4', 'AT 6'],
    topic: 'Chemical Changes',
    summary:
      'Prepare a pure, dry sample of copper(II) sulfate crystals by reacting excess insoluble copper(II) oxide with warm dilute sulfuric acid, filtering, and crystallising.',
    aim: 'To prepare a pure, dry sample of a soluble salt from an insoluble metal oxide and a dilute acid.',
    equation: 'CuO(s) + H₂SO₄(aq) → CuSO₄(aq) + H₂O(l)',
    hazards: [
      {
        substance: 'Dilute sulfuric acid (1.0 mol/dm³)',
        risk: 'Skin and eye irritant',
        control: 'Wear eye protection; warm gently and never boil the acid.',
      },
      {
        substance: 'Copper(II) oxide powder',
        risk: 'Harmful if swallowed; environmental hazard',
        control: 'Handle with spatula; wash hands after practical.',
      },
      {
        substance: 'Hot apparatus & Bunsen burner',
        risk: 'Thermal burns and scalds',
        control: 'Use water bath for crystallisation; leave tripod to cool before moving.',
      },
    ],
    steps: [
      {
        id: 'measure-acid',
        title: 'Measure 40 cm³ dilute H₂SO₄',
        detail: 'Use a measuring cylinder to transfer 40 cm³ of dilute sulfuric acid into a 100 cm³ beaker.',
      },
      {
        id: 'warm-acid',
        title: 'Warm the acid gently',
        detail: 'Heat the acid gently to ~50 °C (do not boil) to increase the rate of reaction.',
      },
      {
        id: 'add-excess-cuo',
        title: 'Add excess copper(II) oxide & stir',
        detail: 'Add CuO spatula by spatula while stirring until unreacted black powder remains at the bottom.',
      },
      {
        id: 'filter-excess',
        title: 'Filter out unreacted CuO',
        detail: 'Pour the mixture through fluted filter paper in a funnel to collect clear blue CuSO₄ filtrate.',
      },
      {
        id: 'evaporate-water-bath',
        title: 'Evaporate over a water bath',
        detail: 'Heat the filtrate gently in an evaporating basin until about half the volume remains and crystals begin to form.',
      },
      {
        id: 'cool-and-dry',
        title: 'Cool, crystallise & pat dry',
        detail: 'Leave to cool slowly so large blue crystals grow, then pat dry between two sheets of filter paper.',
      },
    ],
  },
  {
    id: 'p2-titration',
    number: 2,
    title: 'Neutralisation (Titration)',
    shortTitle: 'Titration',
    aqaRef: '4.4.2.5 · RP 2',
    paper: 1,
    separateOnly: true,
    apparatusCodes: ['AT 1', 'AT 8'],
    topic: 'Chemical Changes',
    summary:
      'Determine the exact reacting volume of hydrochloric acid required to neutralise 25.0 cm³ of 0.100 mol/dm³ sodium hydroxide using a burette, volumetric pipette, and indicator.',
    aim: 'To determine the reacting volumes of a strong acid and strong alkali by titration and calculate the unknown concentration.',
    equation: 'NaOH(aq) + HCl(aq) → NaCl(aq) + H₂O(l)',
    hazards: [
      {
        substance: 'Sodium hydroxide (0.100 mol/dm³)',
        risk: 'Corrosive to eyes and skin irritant',
        control: 'Wear splash-proof goggles; use pipette filler—never pipette by mouth.',
      },
      {
        substance: 'Hydrochloric acid (unknown conc.)',
        risk: 'Irritant',
        control: 'Fill burette below eye level using a small funnel, then remove funnel.',
      },
      {
        substance: 'Phenolphthalein indicator',
        risk: 'Flammable ethanol solvent',
        control: 'Keep away from naked flames; add only 3–4 drops.',
      },
    ],
    steps: [
      {
        id: 'pipette-alkali',
        title: 'Pipette 25.0 cm³ NaOH into flask',
        detail: 'Transfer exactly 25.0 cm³ of 0.100 mol/dm³ NaOH into a clean conical flask placed on a white tile.',
      },
      {
        id: 'add-indicator',
        title: 'Add 3 drops of indicator',
        detail: 'Add phenolphthalein (pink in alkali) or methyl orange (yellow in alkali) and swirl gently.',
      },
      {
        id: 'fill-burette',
        title: 'Fill burette & record initial reading',
        detail: 'Fill the 50 cm³ burette with HCl, check there are no air bubbles in the jet, and read the bottom of the meniscus.',
      },
      {
        id: 'rough-titration',
        title: 'Complete a rough titration',
        detail: 'Add HCl while swirling until the first permanent colour change occurs to find the approximate endpoint.',
      },
      {
        id: 'concordant-runs',
        title: 'Record two concordant titres',
        detail: 'Repeat carefully, adding dropwise near the endpoint, until at least two titres agree within 0.10 cm³.',
      },
      {
        id: 'calculate-conc',
        title: 'Calculate unknown HCl concentration',
        detail: 'Find the mean of concordant titres and use n = c × V to determine the concentration of HCl.',
      },
    ],
  },
  {
    id: 'p3-electrolysis',
    number: 3,
    title: 'Electrolysis of Aqueous Solutions',
    shortTitle: 'Electrolysis',
    aqaRef: '4.4.3.4 · RP 3',
    paper: 1,
    separateOnly: false,
    apparatusCodes: ['AT 3', 'AT 7', 'AT 8'],
    topic: 'Chemical Changes',
    summary:
      'Investigate the products formed at inert graphite electrodes during electrolysis of four aqueous ionic solutions and identify gases using chemical tests.',
    aim: 'To investigate what happens when aqueous solutions are electrolysed using inert electrodes and develop a hypothesis predicting products.',
    equation: 'At cathode (−): Mⁿ⁺ + ne⁻ → M   |   At anode (+): 2X⁻ → X₂ + 2e⁻',
    hazards: [
      {
        substance: 'Chlorine gas (Cl₂)',
        risk: 'Toxic and respiratory irritant',
        control: 'Keep electrolysis voltage at 4–6 V and run only long enough to observe and test with damp litmus.',
      },
      {
        substance: 'Copper(II) chloride & sulfate',
        risk: 'Harmful; skin and eye irritant',
        control: 'Wear eye protection and wash hands immediately after handling solutions.',
      },
    ],
    steps: [
      {
        id: 'select-solution',
        title: 'Fill beaker with aqueous electrolyte',
        detail: 'Pour about 50 cm³ of one of the four test solutions into the electrolysis beaker.',
      },
      {
        id: 'power-on',
        title: 'Insert graphite electrodes & switch on',
        detail: 'Connect inert carbon rods to a 4–6 V DC power supply and observe both the cathode (−) and anode (+).',
      },
      {
        id: 'test-gases',
        title: 'Test gases produced at electrodes',
        detail: 'Use damp blue litmus paper (Cl₂ bleaches white), a burning splint (H₂ pops), or glowing splint (O₂ relights).',
      },
      {
        id: 'test-all-four',
        title: 'Investigate all four aqueous solutions',
        detail: 'Test CuCl₂, NaCl, CuSO₄, and Na₂SO₄ and record cathode and anode observations for each.',
      },
    ],
  },
  {
    id: 'p4-temp-changes',
    number: 4,
    title: 'Investigating Temperature Changes',
    shortTitle: 'Temperature Changes',
    aqaRef: '4.5.1.1 · RP 4',
    paper: 1,
    separateOnly: false,
    apparatusCodes: ['AT 1', 'AT 3', 'AT 5', 'AT 6'],
    topic: 'Energy Changes',
    summary:
      'Measure temperature changes when incremental volumes of sodium hydroxide react with hydrochloric acid inside an insulated polystyrene cup, and plot intersecting best-fit lines.',
    aim: 'To investigate the variables that affect temperature changes in reacting solutions (exothermic neutralisation and endothermic reactions).',
    equation: 'HCl(aq) + NaOH(aq) → NaCl(aq) + H₂O(l)   (ΔH < 0, exothermic)',
    hazards: [
      {
        substance: 'Hydrochloric acid & Sodium hydroxide',
        risk: 'Irritant / corrosive to eyes',
        control: 'Wear safety goggles throughout and wipe up spills immediately.',
      },
      {
        substance: 'Polystyrene cup stability',
        risk: 'Cup may tip and spill reagent',
        control: 'Stand the polystyrene cup inside a glass beaker and fit a cardboard lid.',
      },
    ],
    steps: [
      {
        id: 'setup-calorimeter',
        title: 'Place polystyrene cup in beaker',
        detail: 'Stand the insulated cup inside a glass beaker and measure 30 cm³ of dilute acid into it.',
      },
      {
        id: 'record-initial-temp',
        title: 'Record initial temperature (0 cm³)',
        detail: 'Place the thermometer through the lid, let the reading stabilise, and log the starting temperature.',
      },
      {
        id: 'add-portions',
        title: 'Add alkali in 5 cm³ portions up to 40 cm³',
        detail: 'After each 5 cm³ addition, replace the lid, stir gently, and record the highest (or lowest) temperature reached.',
      },
      {
        id: 'analyse-graph',
        title: 'Inspect the two-line intersection graph',
        detail: 'Use the rising and cooling lines of best fit to determine the maximum temperature change (ΔT) and exact neutralisation volume.',
      },
    ],
  },
  {
    id: 'p5-rates',
    number: 5,
    title: 'Rates of Reaction',
    shortTitle: 'Rates of Reaction',
    aqaRef: '4.6.1.2 · RP 5',
    paper: 2,
    separateOnly: false,
    apparatusCodes: ['AT 1', 'AT 3', 'AT 5', 'AT 6'],
    topic: 'Rate and Extent of Chemical Change',
    summary:
      'Investigate how concentration affects reaction rate using both AQA methods: the sodium thiosulfate disappearing cross (turbidity) and magnesium + acid gas syringe collection.',
    aim: 'To investigate how changes in concentration affect the rates of reactions by measuring turbidity change and gas volume produced.',
    equation: 'Na₂S₂O₃(aq) + 2HCl(aq) → 2NaCl(aq) + H₂O(l) + SO₂(g) + S(s)   |   Mg(s) + 2HCl(aq) → MgCl₂(aq) + H₂(g)',
    hazards: [
      {
        substance: 'Sulfur dioxide gas (SO₂)',
        risk: 'Toxic; can trigger asthma',
        control: 'Work in a well-ventilated lab and dispose of reaction mixture into a sodium carbonate stop-bath.',
      },
      {
        substance: 'Hydrogen gas & Magnesium ribbon',
        risk: 'Flammable gas',
        control: 'Keep all naked flames extinguished during the gas syringe method.',
      },
    ],
    steps: [
      {
        id: 'cross-first-run',
        title: 'Run disappearing cross trial',
        detail: 'Mix sodium thiosulfate and HCl over the black cross, start the stopwatch, and stop it the moment the cross is obscured.',
      },
      {
        id: 'cross-multiple',
        title: 'Test at least 3 concentrations (turbidity)',
        detail: 'Repeat at different Na₂S₂O₃ concentrations (8–40 g/dm³) keeping total volume constant, and compare 1/t rates.',
      },
      {
        id: 'syringe-trial',
        title: 'Collect H₂ gas with gas syringe',
        detail: 'Switch to Method B, react magnesium ribbon with HCl, and record gas volume every 10 seconds for 60 seconds.',
      },
      {
        id: 'compare-curves',
        title: 'Compare initial gradients across concentrations',
        detail: 'Test a second acid concentration on the gas syringe to compare the initial rate gradients on the volume–time graph.',
      },
    ],
  },
  {
    id: 'p6-chromatography',
    number: 6,
    title: 'Paper Chromatography',
    shortTitle: 'Chromatography',
    aqaRef: '4.8.1.3 · RP 6',
    paper: 2,
    separateOnly: false,
    apparatusCodes: ['AT 1', 'AT 4'],
    topic: 'Chemical Analysis',
    summary:
      'Separate known food colourings and an unknown mixture using paper chromatography, measure distances with a virtual millimetre ruler, and calculate Rf values.',
    aim: 'To investigate how paper chromatography can be used to separate and tell the difference between coloured substances and calculate Rf values.',
    equation: 'Rf = distance moved by substance ÷ distance moved by solvent',
    hazards: [
      {
        substance: 'Food colourings & unknown dyes',
        risk: 'Low hazard; may stain skin and clothing',
        control: 'Handle capillary tubes carefully and avoid eye contact.',
      },
      {
        substance: 'Glass beaker & capillary tubes',
        risk: 'Breakage / sharp glass',
        control: 'Place chromatography tank securely on flat bench away from edges.',
      },
    ],
    steps: [
      {
        id: 'draw-pencil-line',
        title: 'Draw a pencil baseline 20 mm from bottom',
        detail: 'Use graphite pencil (insoluble in water)—never ink, which would dissolve and run up the paper.',
      },
      {
        id: 'spot-dyes',
        title: 'Apply known dyes A–D and Unknown U',
        detail: 'Use a clean capillary tube for each dye to place small, concentrated spots along the pencil baseline.',
      },
      {
        id: 'develop-chromatogram',
        title: 'Place in shallow solvent & run',
        detail: 'Suspend the paper so the water level stays below the pencil line, and stop before the solvent reaches the top.',
      },
      {
        id: 'measure-rf',
        title: 'Measure distances & calculate Rf values',
        detail: 'Use the millimetre ruler to measure the solvent front and spot centres, calculate Rf, and identify Unknown U.',
      },
    ],
  },
  {
    id: 'p7-ions',
    number: 7,
    title: 'Identifying Ions',
    shortTitle: 'Identifying Ions',
    aqaRef: '4.8.3.1–4.8.3.5 · RP 7',
    paper: 2,
    separateOnly: true,
    apparatusCodes: ['AT 2', 'AT 8'],
    topic: 'Chemical Analysis',
    summary:
      'Perform flame tests, sodium hydroxide precipitate tests, and carbonate, sulfate, and halide anion tests to identify known reference ions and mystery unknown ionic compounds.',
    aim: 'To use chemical tests to identify the cation and anion present in single unknown ionic compounds.',
    equation: 'Ag⁺(aq) + X⁻(aq) → AgX(s)   |   Ba²⁺(aq) + SO₄²⁻(aq) → BaSO₄(s)   |   CO₃²⁻ + 2H⁺ → CO₂ + H₂O',
    hazards: [
      {
        substance: 'Concentrated HCl / Dilute HNO₃ / NaOH',
        risk: 'Corrosive to eyes and skin',
        control: 'Wear eye protection; use dropping pipettes carefully.',
      },
      {
        substance: 'Barium chloride & Silver nitrate',
        risk: 'Toxic (BaCl₂) / stains skin black (AgNO₃)',
        control: 'Add only a few drops; wash hands thoroughly after practical.',
      },
      {
        substance: 'Roaring Bunsen flame',
        risk: 'High temperature burn hazard',
        control: 'Switch back to yellow safety flame when not actively testing wire loops.',
      },
    ],
    steps: [
      {
        id: 'flame-test',
        title: 'Clean wire & perform flame test',
        detail: 'Dip the nichrome loop in HCl, flame until clean, pick up sample, and observe the flame colour in a roaring blue flame.',
      },
      {
        id: 'naoh-test',
        title: 'Run NaOH precipitate test',
        detail: 'Add drops of NaOH solution to test for Cu²⁺, Fe²⁺, Fe³⁺, Al³⁺, Ca²⁺, or Mg²⁺; add excess NaOH to check if white precipitate redissolves.',
      },
      {
        id: 'anion-tests',
        title: 'Perform carbonate, sulfate & halide tests',
        detail: 'Test with dilute acid + limewater (CO₃²⁻), dilute HCl + BaCl₂ (SO₄²⁻), and dilute HNO₃ + AgNO₃ (Cl⁻, Br⁻, I⁻).',
      },
      {
        id: 'solve-mystery',
        title: 'Identify at least one Mystery Sample',
        detail: 'Combine cation and anion evidence for Unknown X, Y, or Z and submit your verified compound identification.',
      },
    ],
  },
  {
    id: 'p8-water',
    number: 8,
    title: 'Analysis & Purification of Water',
    shortTitle: 'Water Purification',
    aqaRef: '4.10.1.2 · RP 8',
    paper: 2,
    separateOnly: false,
    apparatusCodes: ['AT 2', 'AT 3', 'AT 4'],
    topic: 'Using Resources',
    summary:
      'Analyse pH and mass of dissolved solids across natural and tap water samples, then purify impure sea water by simple distillation and verify the purity of the distillate.',
    aim: 'To analyse water samples from different sources for pH and dissolved solids, and to purify a sample by simple distillation.',
    equation: 'H₂O(l) + dissolved salts  —(heat & condense)→  H₂O(l) pure distillate',
    hazards: [
      {
        substance: 'Boiling water & steam',
        risk: 'Severe scalds and bumping',
        control: 'Always add anti-bumping granules before heating; heat gently and watch the ice bath.',
      },
      {
        substance: 'Hot evaporating basin',
        risk: 'Thermal burns',
        control: 'Allow basin to cool completely on a heatproof mat before placing on the digital balance.',
      },
    ],
    steps: [
      {
        id: 'test-ph',
        title: 'Measure pH of water samples',
        detail: 'Dip universal indicator paper into each water sample and match the colour against the pH 1–14 scale.',
      },
      {
        id: 'measure-dissolved-solids',
        title: 'Weigh basin, evaporate & find dissolved solids',
        detail: 'Weigh an empty evaporating basin to 0.01 g, evaporate 25 cm³ of water to dryness, cool, re-weigh, and subtract.',
      },
      {
        id: 'setup-distillation',
        title: 'Assemble distillation & add anti-bumping granules',
        detail: 'Switch to Part 2, add sea water and anti-bumping granules to the conical flask, and check the ice-water condenser bath.',
      },
      {
        id: 'distil-and-verify',
        title: 'Distil gently & verify distillate purity',
        detail: 'Heat gently at 100 °C to collect pure condensate, then test the distillate pH (7.0) and residue (0.00 g).',
      },
    ],
  },
];

export const PRACTICAL_MAP: Record<string, PracticalMeta> = Object.fromEntries(
  PRACTICALS.map((p) => [p.id, p])
);
