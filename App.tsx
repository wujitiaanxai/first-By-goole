import React, { useState } from 'react';
import { LayoutDashboard, PlayCircle, BookOpen, Menu, X } from 'lucide-react';
import { Simulation } from './components/Simulation';
import { Analysis } from './components/Analysis';
import { Theory } from './components/Theory';
import { AppMode } from './types';

export default function App() {
  const [mode, setMode] = useState<AppMode>(AppMode.SIMULATION);
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const NavItem = ({ m, icon: Icon, label }: { m: AppMode, icon: any, label: string }) => (
    <button
      onClick={() => { setMode(m); setSidebarOpen(false); }}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm
        ${mode === m 
          ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' 
          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}
    >
      <Icon className="w-5 h-5" />
      {label}
    </button>
  );

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button 
          onClick={() => setSidebarOpen(!isSidebarOpen)}
          className="p-2 bg-white rounded-lg shadow-sm border border-slate-200"
        >
          {isSidebarOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-slate-200 transform transition-transform duration-300 ease-in-out
        lg:relative lg:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-6 h-full flex flex-col">
          <div className="flex items-center gap-2 mb-10 text-slate-800">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">T</div>
            <span className="text-xl font-bold tracking-tight">Trifilar Lab</span>
          </div>

          <nav className="space-y-2 flex-1">
            <NavItem m={AppMode.SIMULATION} icon={PlayCircle} label="Simulation" />
            <NavItem m={AppMode.ANALYSIS} icon={LayoutDashboard} label="Data Analysis" />
            <NavItem m={AppMode.THEORY} icon={BookOpen} label="Design & Theory" />
          </nav>

          <div className="pt-6 border-t border-slate-100">
            <div className="bg-blue-50 p-4 rounded-xl">
              <h4 className="text-xs font-bold text-blue-800 uppercase tracking-wide mb-2">Final Project</h4>
              <p className="text-xs text-blue-600 leading-relaxed">
                Designed for precise measurement of Moment of Inertia using the three-line pendulum method.
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto w-full">
        <header className="sticky top-0 z-30 bg-slate-50/80 backdrop-blur-sm border-b border-slate-200 px-8 py-4 flex justify-between items-center">
          <h1 className="text-xl font-semibold text-slate-800">
            {mode === AppMode.SIMULATION && 'Virtual Experiment'}
            {mode === AppMode.ANALYSIS && 'Lab Report & Calculator'}
            {mode === AppMode.THEORY && 'System Architecture'}
          </h1>
          <div className="text-xs text-slate-400 font-mono hidden sm:block">
             v1.0.0 • React • Tailwind
          </div>
        </header>

        <div className="p-4 lg:p-8 max-w-[1600px] mx-auto">
          {mode === AppMode.SIMULATION && <Simulation />}
          {mode === AppMode.ANALYSIS && <Analysis />}
          {mode === AppMode.THEORY && <Theory />}
        </div>
      </main>

      {/* Overlay for mobile sidebar */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}