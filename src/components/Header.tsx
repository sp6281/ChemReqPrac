import React from 'react';
import { Download } from 'lucide-react';
import { AppView } from '../types/lab';
import { useLab } from '../context/LabContext';

interface HeaderProps {
  activeView: AppView;
  onNavigate: (view: AppView) => void;
}

export const Header: React.FC<HeaderProps> = ({ activeView, onNavigate }) => {
  const { exportLabReportCsv } = useLab();

  const navItems: { id: AppView; label: string }[] = [
    { id: 'directory', label: 'Practicals' },
    { id: 'workbench', label: 'Workbench' },
    { id: 'notebook', label: 'Lab Notebook' },
    { id: 'reference', label: 'Reference' },
  ];

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-slate-200">
      <div className="max-w-[1440px] mx-auto px-6 h-16 flex items-center justify-between gap-8">
        <button
          type="button"
          onClick={() => onNavigate('directory')}
          className="text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-600 rounded-sm"
        >
          ChemBench
        </button>

        <nav aria-label="Main navigation" className="flex items-center gap-6 overflow-x-auto">
          {navItems.map((item) => {
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onNavigate(item.id)}
                className={`text-sm font-medium whitespace-nowrap shrink-0 py-1 border-b-2 transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-600 ${
                  isActive
                    ? 'text-slate-900 border-blue-700'
                    : 'text-slate-600 border-transparent hover:text-slate-900 hover:border-slate-300'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="shrink-0">
          <button
            type="button"
            onClick={exportLabReportCsv}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
          >
            <Download className="w-3.5 h-3.5" aria-hidden="true" />
            Export Report
          </button>
        </div>
      </div>
    </header>
  );
};
