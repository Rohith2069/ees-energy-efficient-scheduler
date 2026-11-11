/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { SimulationProvider, useSimulation } from './context/SimulationContext';
import { Sidebar } from './components/layout/Sidebar';
import { TopHeader } from './components/layout/TopHeader';
import { Dashboard } from './pages/Dashboard';
import { ProcessManager } from './pages/ProcessManager';
import { SchedulingEngine } from './pages/SchedulingEngine';
import { PerformanceAnalysis } from './pages/PerformanceAnalysis';
import { UniversityReport } from './pages/UniversityReport';

const AppContent: React.FC = () => {
  const { activePage } = useSimulation();

  const renderActivePage = () => {
    switch (activePage) {
      case 'dashboard':
        return <Dashboard />;
      case 'process-manager':
        return <ProcessManager />;
      case 'scheduling-engine':
        return <SchedulingEngine />;
      case 'performance-analysis':
        return <PerformanceAnalysis />;
      case 'university-report':
        return <UniversityReport />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <TopHeader />
        <main className="flex-1 pb-16">
          {renderActivePage()}
        </main>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <SimulationProvider>
      <AppContent />
    </SimulationProvider>
  );
}
