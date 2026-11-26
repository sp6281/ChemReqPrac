export type PracticalId =
  | 'p1-salts'
  | 'p2-titration'
  | 'p3-electrolysis'
  | 'p4-temp-changes'
  | 'p5-rates'
  | 'p6-chromatography'
  | 'p7-ions'
  | 'p8-water';

export type AppView = 'directory' | 'workbench' | 'notebook' | 'reference';

export type RouteFilter = 'all' | 'combined' | 'separate' | 'paper1' | 'paper2';

export interface PracticalStep {
  id: string;
  title: string;
  detail: string;
}

export interface PracticalMeta {
  id: PracticalId;
  number: number;
  title: string;
  shortTitle: string;
  aqaRef: string;
  paper: 1 | 2;
  separateOnly: boolean;
  apparatusCodes: string[];
  topic: string;
  summary: string;
  aim: string;
  hazards: { substance: string; risk: string; control: string }[];
  equation: string;
  steps: PracticalStep[];
}

export interface TitrationRun {
  id: string;
  label: string;
  indicator: 'phenolphthalein' | 'methyl-orange';
  initialCm3: number;
  finalCm3: number;
  titreCm3: number;
  overshot: boolean;
}

export interface ElectrolysisRecord {
  solutionId: string;
  solutionName: string;
  cathodeObs: string;
  cathodeProduct: string;
  anodeObs: string;
  anodeProduct: string;
  gasTestUsed: string;
}

export interface TempReading {
  volumeCm3: number;
  tempC: number;
  mode: 'exothermic' | 'endothermic';
}

export interface TurbidityReading {
  concentrationGdm3: number;
  timeS: number;
  ratePerS: number;
}

export interface GasSyringeSeries {
  concentrationMol: number;
  points: { timeS: number; volumeCm3: number }[];
}

export interface ChromatographyRecord {
  sampleId: string;
  sampleLabel: string;
  spotDistanceMm: number;
  solventFrontMm: number;
  rfValue: number;
}

export interface IonTestRecord {
  sampleId: string;
  sampleLabel: string;
  flameResult: string;
  naohResult: string;
  anionTest: string;
  anionResult: string;
  studentIdentification: string;
  verified?: boolean;
}

export interface WaterAnalysisRecord {
  sampleId: string;
  sampleName: string;
  ph: number | null;
  emptyBasinG: number | null;
  finalBasinG: number | null;
  dissolvedSolidsG: number | null;
}

export interface SaltTrialRecord {
  acidVolumeCm3: number;
  warmedTempC: number;
  cuoSpatulas: number;
  filteredClearBlue: boolean;
  crystallised: boolean;
  dryYieldG: number;
}

export interface PracticalNotebookData {
  completedSteps: string[];
  observations: string;
  conclusion: string;
  lastUpdated: string | null;
}

export interface LabState {
  notebooks: Record<PracticalId, PracticalNotebookData>;
  saltTrial: SaltTrialRecord | null;
  titrationRuns: TitrationRun[];
  electrolysisRecords: ElectrolysisRecord[];
  tempReadings: TempReading[];
  turbidityReadings: TurbidityReading[];
  gasSyringeSeries: GasSyringeSeries[];
  chromatographyRecords: ChromatographyRecord[];
  ionRecords: IonTestRecord[];
  waterRecords: WaterAnalysisRecord[];
  distillationCompleted: boolean;
  distillatePh: number | null;
  distillateBpC: number | null;
}
