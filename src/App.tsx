import React, { useState } from 'react';
import { LabProvider } from './context/LabContext';
import { Header } from './components/Header';
import { DirectoryView } from './components/DirectoryView';
import { LabNotebookView } from './components/LabNotebookView';
import { ReferenceView } from './components/ReferenceView';
import { Practical1Salts } from './components/labs/Practical1Salts';
import { Practical2Titration } from './components/labs/Practical2Titration';
import { Practical3Electrolysis } from './components/labs/Practical3Electrolysis';
import { Practical4TempChanges } from './components/labs/Practical4TempChanges';
import { Practical5Rates } from './components/labs/Practical5Rates';
import { Practical6Chromatography } from './components/labs/Practical6Chromatography';
import { Practical7Ions } from './components/labs/Practical7Ions';
import { Practical8Water } from './components/labs/Practical8Water';
import { AppView, PracticalId } from './types/lab';

function ChemBenchApp() {
  const [activeView, setActiveView] = useState<AppView>('directory');
  const [activePractical, setActivePractical] = useState<PracticalId>('p1-salts');

  const handleOpenPractical = (id: PracticalId) => {
    setActivePractical(id);
    setActiveView('workbench');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderWorkbench = () => {
    const props = {
      onSelectPractical: (id: PracticalId) => setActivePractical(id),
      onBackToDirectory: () => setActiveView('directory'),
    };
    switch (activePractical) {
      case 'p1-salts':
        return <Practical1Salts {...props} />;
      case 'p2-titration':
        return <Practical2Titration {...props} />;
      case 'p3-electrolysis':
        return <Practical3Electrolysis {...props} />;
      case 'p4-temp-changes':
        return <Practical4TempChanges {...props} />;
      case 'p5-rates':
        return <Practical5Rates {...props} />;
      case 'p6-chromatography':
        return <Practical6Chromatography {...props} />;
      case 'p7-ions':
        return <Practical7Ions {...props} />;
      case 'p8-water':
        return <Practical8Water {...props} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Header activeView={activeView} onNavigate={setActiveView} />

      <div className="flex-1">
        {activeView === 'directory' && (
          <DirectoryView
            onOpenPractical={handleOpenPractical}
            onOpenNotebook={() => setActiveView('notebook')}
          />
        )}
        {activeView === 'workbench' && renderWorkbench()}
        {activeView === 'notebook' && (
          <LabNotebookView onOpenPractical={handleOpenPractical} />
        )}
        {activeView === 'reference' && <ReferenceView />}
      </div>

      <footer className="mt-16 border-t border-slate-200 bg-white">
        <div className="max-w-[1440px] mx-auto px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <p>ChemBench · AQA GCSE Chemistry (8462) &amp; Combined Science Trilogy (8464) Required Practicals</p>
          <p>All experimental records are saved locally in your browser.</p>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <LabProvider>
      <ChemBenchApp />
    </LabProvider>
  );
}
