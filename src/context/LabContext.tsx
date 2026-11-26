import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  ChromatographyRecord,
  ElectrolysisRecord,
  GasSyringeSeries,
  IonTestRecord,
  LabState,
  PracticalId,
  PracticalNotebookData,
  SaltTrialRecord,
  TempReading,
  TitrationRun,
  TurbidityReading,
  WaterAnalysisRecord,
} from '../types/lab';
import { PRACTICALS } from '../data/practicals';

const STORAGE_KEY = 'chembench_aqa_gcse_lab_v1';

const createEmptyNotebooks = (): Record<PracticalId, PracticalNotebookData> => ({
  'p1-salts': { completedSteps: [], observations: '', conclusion: '', lastUpdated: null },
  'p2-titration': { completedSteps: [], observations: '', conclusion: '', lastUpdated: null },
  'p3-electrolysis': { completedSteps: [], observations: '', conclusion: '', lastUpdated: null },
  'p4-temp-changes': { completedSteps: [], observations: '', conclusion: '', lastUpdated: null },
  'p5-rates': { completedSteps: [], observations: '', conclusion: '', lastUpdated: null },
  'p6-chromatography': { completedSteps: [], observations: '', conclusion: '', lastUpdated: null },
  'p7-ions': { completedSteps: [], observations: '', conclusion: '', lastUpdated: null },
  'p8-water': { completedSteps: [], observations: '', conclusion: '', lastUpdated: null },
});

const INITIAL_STATE: LabState = {
  notebooks: createEmptyNotebooks(),
  saltTrial: null,
  titrationRuns: [],
  electrolysisRecords: [],
  tempReadings: [],
  turbidityReadings: [],
  gasSyringeSeries: [],
  chromatographyRecords: [],
  ionRecords: [],
  waterRecords: [],
  distillationCompleted: false,
  distillatePh: null,
  distillateBpC: null,
};

interface LabContextValue {
  state: LabState;
  completeStep: (practicalId: PracticalId, stepId: string) => void;
  toggleStep: (practicalId: PracticalId, stepId: string) => void;
  updateObservations: (practicalId: PracticalId, observations: string) => void;
  updateConclusion: (practicalId: PracticalId, conclusion: string) => void;
  saveSaltTrial: (record: SaltTrialRecord) => void;
  addTitrationRun: (run: TitrationRun) => void;
  clearTitrationRuns: () => void;
  upsertElectrolysisRecord: (record: ElectrolysisRecord) => void;
  addTempReading: (reading: TempReading) => void;
  clearTempReadings: () => void;
  addTurbidityReading: (reading: TurbidityReading) => void;
  clearTurbidityReadings: () => void;
  upsertGasSyringeSeries: (series: GasSyringeSeries) => void;
  clearGasSyringeSeries: () => void;
  upsertChromatographyRecord: (record: ChromatographyRecord) => void;
  clearChromatographyRecords: () => void;
  upsertIonRecord: (record: IonTestRecord) => void;
  upsertWaterRecord: (record: WaterAnalysisRecord) => void;
  setDistillationResult: (completed: boolean, ph: number | null, bpC: number | null) => void;
  resetPractical: (practicalId: PracticalId) => void;
  resetAllProgress: () => void;
  getPracticalCompletion: (practicalId: PracticalId) => { done: number; total: number; pct: number };
  exportLabReportCsv: () => void;
}

const LabContext = createContext<LabContextValue | null>(null);

export const LabProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<LabState>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return INITIAL_STATE;
      const parsed = JSON.parse(raw) as Partial<LabState>;
      return {
        ...INITIAL_STATE,
        ...parsed,
        notebooks: {
          ...createEmptyNotebooks(),
          ...(parsed.notebooks ?? {}),
        },
      };
    } catch {
      return INITIAL_STATE;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Ignore storage quota errors cleanly
    }
  }, [state]);

  const touchTimestamp = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const completeStep = useCallback((practicalId: PracticalId, stepId: string) => {
    setState((prev) => {
      const nb = prev.notebooks[practicalId];
      if (nb.completedSteps.includes(stepId)) return prev;
      return {
        ...prev,
        notebooks: {
          ...prev.notebooks,
          [practicalId]: {
            ...nb,
            completedSteps: [...nb.completedSteps, stepId],
            lastUpdated: touchTimestamp(),
          },
        },
      };
    });
  }, []);

  const toggleStep = useCallback((practicalId: PracticalId, stepId: string) => {
    setState((prev) => {
      const nb = prev.notebooks[practicalId];
      const exists = nb.completedSteps.includes(stepId);
      return {
        ...prev,
        notebooks: {
          ...prev.notebooks,
          [practicalId]: {
            ...nb,
            completedSteps: exists
              ? nb.completedSteps.filter((s) => s !== stepId)
              : [...nb.completedSteps, stepId],
            lastUpdated: touchTimestamp(),
          },
        },
      };
    });
  }, []);

  const updateObservations = useCallback((practicalId: PracticalId, observations: string) => {
    setState((prev) => ({
      ...prev,
      notebooks: {
        ...prev.notebooks,
        [practicalId]: {
          ...prev.notebooks[practicalId],
          observations,
          lastUpdated: touchTimestamp(),
        },
      },
    }));
  }, []);

  const updateConclusion = useCallback((practicalId: PracticalId, conclusion: string) => {
    setState((prev) => ({
      ...prev,
      notebooks: {
        ...prev.notebooks,
        [practicalId]: {
          ...prev.notebooks[practicalId],
          conclusion,
          lastUpdated: touchTimestamp(),
        },
      },
    }));
  }, []);

  const saveSaltTrial = useCallback((record: SaltTrialRecord) => {
    setState((prev) => ({ ...prev, saltTrial: record }));
  }, []);

  const addTitrationRun = useCallback((run: TitrationRun) => {
    setState((prev) => ({ ...prev, titrationRuns: [...prev.titrationRuns, run] }));
  }, []);

  const clearTitrationRuns = useCallback(() => {
    setState((prev) => ({ ...prev, titrationRuns: [] }));
  }, []);

  const upsertElectrolysisRecord = useCallback((record: ElectrolysisRecord) => {
    setState((prev) => {
      const idx = prev.electrolysisRecords.findIndex((r) => r.solutionId === record.solutionId);
      if (idx === -1) {
        return { ...prev, electrolysisRecords: [...prev.electrolysisRecords, record] };
      }
      const next = [...prev.electrolysisRecords];
      next[idx] = record;
      return { ...prev, electrolysisRecords: next };
    });
  }, []);

  const addTempReading = useCallback((reading: TempReading) => {
    setState((prev) => {
      const filtered = prev.tempReadings.filter(
        (r) => !(r.volumeCm3 === reading.volumeCm3 && r.mode === reading.mode)
      );
      return {
        ...prev,
        tempReadings: [...filtered, reading].sort((a, b) => a.volumeCm3 - b.volumeCm3),
      };
    });
  }, []);

  const clearTempReadings = useCallback(() => {
    setState((prev) => ({ ...prev, tempReadings: [] }));
  }, []);

  const addTurbidityReading = useCallback((reading: TurbidityReading) => {
    setState((prev) => {
      const filtered = prev.turbidityReadings.filter(
        (r) => r.concentrationGdm3 !== reading.concentrationGdm3
      );
      return {
        ...prev,
        turbidityReadings: [...filtered, reading].sort(
          (a, b) => a.concentrationGdm3 - b.concentrationGdm3
        ),
      };
    });
  }, []);

  const clearTurbidityReadings = useCallback(() => {
    setState((prev) => ({ ...prev, turbidityReadings: [] }));
  }, []);

  const upsertGasSyringeSeries = useCallback((series: GasSyringeSeries) => {
    setState((prev) => {
      const filtered = prev.gasSyringeSeries.filter(
        (s) => s.concentrationMol !== series.concentrationMol
      );
      return {
        ...prev,
        gasSyringeSeries: [...filtered, series].sort(
          (a, b) => a.concentrationMol - b.concentrationMol
        ),
      };
    });
  }, []);

  const clearGasSyringeSeries = useCallback(() => {
    setState((prev) => ({ ...prev, gasSyringeSeries: [] }));
  }, []);

  const upsertChromatographyRecord = useCallback((record: ChromatographyRecord) => {
    setState((prev) => {
      const filtered = prev.chromatographyRecords.filter((r) => r.sampleId !== record.sampleId);
      return { ...prev, chromatographyRecords: [...filtered, record] };
    });
  }, []);

  const clearChromatographyRecords = useCallback(() => {
    setState((prev) => ({ ...prev, chromatographyRecords: [] }));
  }, []);

  const upsertIonRecord = useCallback((record: IonTestRecord) => {
    setState((prev) => {
      const idx = prev.ionRecords.findIndex((r) => r.sampleId === record.sampleId);
      if (idx === -1) return { ...prev, ionRecords: [...prev.ionRecords, record] };
      const next = [...prev.ionRecords];
      next[idx] = { ...next[idx], ...record };
      return { ...prev, ionRecords: next };
    });
  }, []);

  const upsertWaterRecord = useCallback((record: WaterAnalysisRecord) => {
    setState((prev) => {
      const idx = prev.waterRecords.findIndex((r) => r.sampleId === record.sampleId);
      if (idx === -1) return { ...prev, waterRecords: [...prev.waterRecords, record] };
      const next = [...prev.waterRecords];
      next[idx] = { ...next[idx], ...record };
      return { ...prev, waterRecords: next };
    });
  }, []);

  const setDistillationResult = useCallback(
    (completed: boolean, ph: number | null, bpC: number | null) => {
      setState((prev) => ({
        ...prev,
        distillationCompleted: completed,
        distillatePh: ph,
        distillateBpC: bpC,
      }));
    },
    []
  );

  const resetPractical = useCallback((practicalId: PracticalId) => {
    setState((prev) => {
      const next: LabState = {
        ...prev,
        notebooks: {
          ...prev.notebooks,
          [practicalId]: { completedSteps: [], observations: '', conclusion: '', lastUpdated: null },
        },
      };
      if (practicalId === 'p1-salts') next.saltTrial = null;
      if (practicalId === 'p2-titration') next.titrationRuns = [];
      if (practicalId === 'p3-electrolysis') next.electrolysisRecords = [];
      if (practicalId === 'p4-temp-changes') next.tempReadings = [];
      if (practicalId === 'p5-rates') {
        next.turbidityReadings = [];
        next.gasSyringeSeries = [];
      }
      if (practicalId === 'p6-chromatography') next.chromatographyRecords = [];
      if (practicalId === 'p7-ions') next.ionRecords = [];
      if (practicalId === 'p8-water') {
        next.waterRecords = [];
        next.distillationCompleted = false;
        next.distillatePh = null;
        next.distillateBpC = null;
      }
      return next;
    });
  }, []);

  const resetAllProgress = useCallback(() => {
    setState(INITIAL_STATE);
  }, []);

  const getPracticalCompletion = useCallback(
    (practicalId: PracticalId) => {
      const meta = PRACTICALS.find((p) => p.id === practicalId);
      const total = meta ? meta.steps.length : 1;
      const done = state.notebooks[practicalId]?.completedSteps.length ?? 0;
      return { done, total, pct: Math.round((done / total) * 100) };
    },
    [state.notebooks]
  );

  const exportLabReportCsv = useCallback(() => {
    const esc = (v: string | number | null | undefined) => {
      const str = String(v ?? '').replace(/"/g, '""');
      return `"${str}"`;
    };
    const lines: string[] = [
      'AQA GCSE Chemistry Virtual Laboratory — Student Experimental Report',
      `Exported,${esc(new Date().toLocaleString())}`,
      '',
      'Section,Practical,Metric / Sample,Value / Observations,Notes / Verification',
    ];

    PRACTICALS.forEach((p) => {
      const nb = state.notebooks[p.id];
      const done = nb.completedSteps.length;
      lines.push(
        [
          esc('Progress'),
          esc(`RP ${p.number}: ${p.shortTitle}`),
          esc(`${done}/${p.steps.length} steps completed`),
          esc(nb.observations || 'No written observations yet'),
          esc(nb.conclusion || ''),
        ].join(',')
      );
    });

    if (state.saltTrial) {
      lines.push(
        [
          esc('RP 1 Data'),
          esc('Making Salts'),
          esc('Copper(II) sulfate synthesis'),
          esc(`${state.saltTrial.acidVolumeCm3} cm3 H2SO4 warmed to ${state.saltTrial.warmedTempC} C; ${state.saltTrial.cuoSpatulas} spatulas CuO`),
          esc(`Dry blue crystal yield: ${state.saltTrial.dryYieldG.toFixed(2)} g`),
        ].join(',')
      );
    }

    state.titrationRuns.forEach((r) => {
      lines.push(
        [
          esc('RP 2 Data'),
          esc('Titration'),
          esc(`${r.label} (${r.indicator})`),
          esc(`Initial ${r.initialCm3.toFixed(2)} cm3 -> Final ${r.finalCm3.toFixed(2)} cm3`),
          esc(`Titre: ${r.titreCm3.toFixed(2)} cm3`),
        ].join(',')
      );
    });

    state.electrolysisRecords.forEach((r) => {
      lines.push(
        [
          esc('RP 3 Data'),
          esc('Electrolysis'),
          esc(r.solutionName),
          esc(`Cathode: ${r.cathodeProduct} (${r.cathodeObs}) | Anode: ${r.anodeProduct} (${r.anodeObs})`),
          esc(`Gas test: ${r.gasTestUsed}`),
        ].join(',')
      );
    });

    state.tempReadings.forEach((r) => {
      lines.push(
        [
          esc('RP 4 Data'),
          esc('Temperature Changes'),
          esc(`${r.mode} — ${r.volumeCm3} cm3 added`),
          esc(`${r.tempC.toFixed(1)} °C`),
          esc('Polystyrene cup calorimeter'),
        ].join(',')
      );
    });

    state.turbidityReadings.forEach((r) => {
      lines.push(
        [
          esc('RP 5a Data'),
          esc('Rates (Disappearing Cross)'),
          esc(`${r.concentrationGdm3} g/dm3 Na2S2O3`),
          esc(`Time: ${r.timeS.toFixed(1)} s`),
          esc(`Rate (1/t): ${r.ratePerS.toFixed(4)} s^-1`),
        ].join(',')
      );
    });

    state.gasSyringeSeries.forEach((s) => {
      const finalPt = s.points[s.points.length - 1];
      lines.push(
        [
          esc('RP 5b Data'),
          esc('Rates (Gas Syringe)'),
          esc(`${s.concentrationMol.toFixed(1)} mol/dm3 HCl + Mg`),
          esc(`${s.points.length} readings recorded`),
          esc(`Final volume: ${finalPt ? finalPt.volumeCm3.toFixed(1) : 0} cm3 at ${finalPt ? finalPt.timeS : 0} s`),
        ].join(',')
      );
    });

    state.chromatographyRecords.forEach((r) => {
      lines.push(
        [
          esc('RP 6 Data'),
          esc('Chromatography'),
          esc(r.sampleLabel),
          esc(`Spot: ${r.spotDistanceMm.toFixed(1)} mm / Solvent: ${r.solventFrontMm.toFixed(1)} mm`),
          esc(`Rf = ${r.rfValue.toFixed(2)}`),
        ].join(',')
      );
    });

    state.ionRecords.forEach((r) => {
      lines.push(
        [
          esc('RP 7 Data'),
          esc('Identifying Ions'),
          esc(r.sampleLabel),
          esc(`Flame: ${r.flameResult || '-'} | NaOH: ${r.naohResult || '-'} | Anion: ${r.anionResult || '-'}`),
          esc(r.studentIdentification || 'Pending ID'),
        ].join(',')
      );
    });

    state.waterRecords.forEach((r) => {
      lines.push(
        [
          esc('RP 8 Data'),
          esc('Water Analysis'),
          esc(r.sampleName),
          esc(`pH: ${r.ph ?? '-'} | Dissolved solids: ${r.dissolvedSolidsG !== null ? `${r.dissolvedSolidsG.toFixed(2)} g` : '-'}`),
          esc(state.distillationCompleted ? `Distillate pH ${state.distillatePh ?? 7.0}, BP ${state.distillateBpC ?? 100.0} C` : ''),
        ].join(',')
      );
    });

    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `aqa-gcse-chemistry-lab-report-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [state]);

  return (
    <LabContext.Provider
      value={{
        state,
        completeStep,
        toggleStep,
        updateObservations,
        updateConclusion,
        saveSaltTrial,
        addTitrationRun,
        clearTitrationRuns,
        upsertElectrolysisRecord,
        addTempReading,
        clearTempReadings,
        addTurbidityReading,
        clearTurbidityReadings,
        upsertGasSyringeSeries,
        clearGasSyringeSeries,
        upsertChromatographyRecord,
        clearChromatographyRecords,
        upsertIonRecord,
        upsertWaterRecord,
        setDistillationResult,
        resetPractical,
        resetAllProgress,
        getPracticalCompletion,
        exportLabReportCsv,
      }}
    >
      {children}
    </LabContext.Provider>
  );
};

export const useLab = (): LabContextValue => {
  const ctx = useContext(LabContext);
  if (!ctx) throw new Error('useLab must be used within LabProvider');
  return ctx;
};
