import React, { useState } from 'react';
import { ArrowRight, CheckCircle2, FlaskConical } from 'lucide-react';
import { PRACTICALS } from '../data/practicals';
import { PracticalId, RouteFilter } from '../types/lab';
import { useLab } from '../context/LabContext';

interface DirectoryViewProps {
  onOpenPractical: (id: PracticalId) => void;
  onOpenNotebook: () => void;
}

const HERO_IMG = '/src/assets/images/hero_chemistry_workbench_1795694183070.jpg';

export const DirectoryView: React.FC<DirectoryViewProps> = ({
  onOpenPractical,
  onOpenNotebook,
}) => {
  const [filter, setFilter] = useState<RouteFilter>('all');
  const [imgError, setImgError] = useState(false);
  const { getPracticalCompletion, state } = useLab();

  const filteredPracticals = PRACTICALS.filter((p) => {
    if (filter === 'combined') return !p.separateOnly;
    if (filter === 'separate') return p.separateOnly;
    if (filter === 'paper1') return p.paper === 1;
    if (filter === 'paper2') return p.paper === 2;
    return true;
  });

  const totalSteps = PRACTICALS.reduce((acc, p) => acc + p.steps.length, 0);
  const completedSteps = PRACTICALS.reduce(
    (acc, p) => acc + (state.notebooks[p.id]?.completedSteps.length ?? 0),
    0
  );
  const completedPracticals = PRACTICALS.filter((p) => {
    const c = getPracticalCompletion(p.id);
    return c.done === c.total;
  }).length;

  const totalDataPoints =
    (state.saltTrial ? 1 : 0) +
    state.titrationRuns.length +
    state.electrolysisRecords.length +
    state.tempReadings.length +
    state.turbidityReadings.length +
    state.gasSyringeSeries.reduce((sum, s) => sum + s.points.length, 0) +
    state.chromatographyRecords.length +
    state.ionRecords.length +
    state.waterRecords.length;

  const filterButtons: { id: RouteFilter; label: string }[] = [
    { id: 'all', label: 'All 8 Practicals' },
    { id: 'combined', label: 'Combined Science (6)' },
    { id: 'separate', label: 'Separate Chemistry Only (2)' },
    { id: 'paper1', label: 'Paper 1' },
    { id: 'paper2', label: 'Paper 2' },
  ];

  return (
    <main className="max-w-[1440px] mx-auto px-6 py-10 space-y-12">
      {/* Hero 2-column split */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        <div className="lg:col-span-6 flex flex-col justify-between bg-white border border-slate-200 rounded-xl p-8">
          <div className="space-y-5">
            <p className="text-xs font-medium text-slate-500">
              AQA GCSE Chemistry (8462) · Combined Science Trilogy (8464)
            </p>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 leading-tight [text-wrap:balance]">
              Complete all eight AQA required chemistry practicals safely online
            </h1>
            <p className="text-base text-slate-600 leading-relaxed max-w-xl">
              Practise real laboratory techniques from titration and electrolysis to calorimetry,
              chromatography, and ion analysis. Take direct readings from calibrated instruments,
              plot live graphs, and keep a persistent experimental lab notebook.
            </p>
          </div>

          <div className="pt-8 mt-8 border-t border-slate-200 flex flex-wrap items-center gap-4">
            <button
              type="button"
              onClick={() => onOpenPractical('p1-salts')}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Launch Practical 1
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={onOpenNotebook}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Open Lab Notebook
            </button>
          </div>
        </div>

        <div className="lg:col-span-6 relative rounded-xl overflow-hidden border border-slate-200 bg-slate-100 min-h-[280px]">
          {!imgError ? (
            <img
              src={HERO_IMG}
              alt="Modern chemistry laboratory bench with copper sulfate flasks, burette on retort stand, evaporating basin, and analytical balance"
              referrerPolicy="no-referrer"
              onError={() => setImgError(true)}
              className="w-full h-full object-cover lg:h-full"
            />
          ) : (
            <div className="w-full h-full min-h-[280px] flex flex-col items-center justify-center bg-gradient-to-br from-slate-100 to-blue-50 p-8 text-center">
              <FlaskConical className="w-12 h-12 text-blue-700 mb-3" aria-hidden="true" />
              <p className="text-sm font-semibold text-slate-800">
                AQA GCSE Chemistry Virtual Laboratory
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Interactive glassware, instruments, and live analysis
              </p>
            </div>
          )}
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/80 via-slate-950/35 to-transparent p-6">
            <p className="text-xs font-mono text-slate-200">
              AT 1–8 Apparatus &amp; Techniques · Safe Digital Workbench
            </p>
            <p className="text-sm font-medium text-white mt-1">
              Calibrated burettes, Bunsen controls, digital balances, calorimeters, and gas tests
            </p>
          </div>
        </div>
      </section>

      {/* Full-width 4-column progress strip */}
      <section
        aria-label="Laboratory progress summary"
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <p className="text-xs text-slate-500">Required Practicals</p>
          <p className="mt-1.5 text-2xl font-semibold font-mono tabular-nums text-slate-900">
            {completedPracticals}
            <span className="text-sm font-normal text-slate-400 ml-1">/ 8 complete</span>
          </p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <p className="text-xs text-slate-500">Protocol Techniques Verified</p>
          <p className="mt-1.5 text-2xl font-semibold font-mono tabular-nums text-slate-900">
            {completedSteps}
            <span className="text-sm font-normal text-slate-400 ml-1">/ {totalSteps} steps</span>
          </p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <p className="text-xs text-slate-500">Recorded Measurements</p>
          <p className="mt-1.5 text-2xl font-semibold font-mono tabular-nums text-slate-900">
            {totalDataPoints}
            <span className="text-sm font-normal text-slate-400 ml-1">entries logged</span>
          </p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <p className="text-xs text-slate-500">Syllabus Coverage</p>
          <p className="mt-1.5 text-2xl font-semibold font-mono tabular-nums text-slate-900">
            100%
            <span className="text-sm font-normal text-slate-400 ml-1">AQA 8462</span>
          </p>
        </div>
      </section>

      {/* Practicals Grid Section */}
      <section className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-5">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              Required Practical Directory
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              Select a practical to enter the interactive workbench, follow safety protocols, and log results.
            </p>
          </div>

          <div
            role="tablist"
            aria-label="Filter practicals"
            className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg overflow-x-auto"
          >
            {filterButtons.map((btn) => (
              <button
                key={btn.id}
                role="tab"
                aria-selected={filter === btn.id}
                type="button"
                onClick={() => setFilter(btn.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  filter === btn.id
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredPracticals.map((practical) => {
            const completion = getPracticalCompletion(practical.id);
            const isComplete = completion.done === completion.total;
            return (
              <article
                key={practical.id}
                className="bg-white border border-slate-200 hover:border-slate-300 rounded-xl p-6 flex flex-col justify-between transition-colors"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-4 text-xs text-slate-500">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono font-semibold text-slate-700">
                        Practical 0{practical.number}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>Paper {practical.paper}</span>
                      <span aria-hidden="true">·</span>
                      <span>
                        {practical.separateOnly ? 'Separate Chemistry Only' : 'Combined & Separate'}
                      </span>
                    </div>
                    {isComplete && (
                      <span className="inline-flex items-center gap-1 text-emerald-700 font-medium whitespace-nowrap shrink-0">
                        <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                        Complete
                      </span>
                    )}
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                    {practical.number}. {practical.title}
                  </h3>

                  <p className="text-sm text-slate-600 leading-relaxed">{practical.summary}</p>

                  <p className="text-xs font-mono text-slate-500 pt-1">
                    {practical.aqaRef} · {practical.apparatusCodes.join(', ')} · {practical.topic}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 flex-1 max-w-[200px]">
                    <div className="h-1.5 flex-1 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${
                          isComplete ? 'bg-emerald-600' : 'bg-blue-600'
                        }`}
                        style={{ width: `${completion.pct}%` }}
                      />
                    </div>
                    <span className="text-xs font-mono tabular-nums text-slate-500 whitespace-nowrap">
                      {completion.done}/{completion.total} steps
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => onOpenPractical(practical.id)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    {completion.done > 0 ? 'Continue Lab' : 'Start Practical'}
                    <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
};
