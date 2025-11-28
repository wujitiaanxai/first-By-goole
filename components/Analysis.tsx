import React, { useState } from 'react';
import { Calculator, FileText, Loader2, Save } from 'lucide-react';
import { ExperimentRecord } from '../types';
import { generateLabReport } from '../services/geminiService';

export const Analysis: React.FC = () => {
  const [data, setData] = useState({
    m0: 1.45, // Mass of lower disk
    m1: 0.55, // Mass of test object
    R: 0.10,  // Radius on disk
    r: 0.05,  // Radius on top
    H: 0.80,  // Length of wire
    T0: 1.85, // Period empty
    T1: 2.15  // Period with object
  });

  const [report, setReport] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<{I0: number, I1: number} | null>(null);

  const calculate = () => {
    // Formula: I0 = (m0 * g * R * r * T0^2) / (4 * pi^2 * H)
    const G = 9.81;
    const factor = (G * data.R * data.r) / (4 * Math.PI * Math.PI * data.H);
    
    const I0 = data.m0 * factor * Math.pow(data.T0, 2);
    // For combined system: I_total = (m0 + m1) * factor * T1^2
    const I_total = (data.m0 + data.m1) * factor * Math.pow(data.T1, 2);
    const I1 = I_total - I0; // Moment of inertia of the object alone

    setResults({ I0, I1 });
    return { I0, I1 };
  };

  const handleGenerateReport = async () => {
    setLoading(true);
    setReport(null);
    const calculated = calculate(); // Ensure fresh results
    
    const record: ExperimentRecord = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      ...data,
      calculatedI0: calculated.I0,
      calculatedI1: calculated.I1
    };

    const aiResponse = await generateLabReport(record);
    setReport(aiResponse);
    setLoading(false);
  };

  const InputGroup = ({ label, val, k, unit }: { label: string, val: number, k: keyof typeof data, unit: string }) => (
    <div>
      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">{label}</label>
      <div className="relative">
        <input 
          type="number" step="0.001"
          value={val}
          onChange={(e) => setData({ ...data, [k]: parseFloat(e.target.value) })}
          className="w-full pl-3 pr-8 py-2 bg-slate-50 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
        <span className="absolute right-3 top-2 text-slate-400 text-sm">{unit}</span>
      </div>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Input Section */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Calculator className="w-5 h-5 text-blue-600" />
            Experiment Data Entry
          </h2>
          <button 
            onClick={() => calculate()}
            className="text-sm bg-blue-50 text-blue-700 px-3 py-1 rounded-full font-medium hover:bg-blue-100"
          >
            Calculate I
          </button>
        </div>

        <div className="grid grid-cols-2 gap-x-4 gap-y-6">
           <div className="col-span-2 pb-2 border-b border-slate-100 font-medium text-slate-700">System Constants</div>
           <InputGroup label="Disk Mass (m₀)" val={data.m0} k="m0" unit="kg" />
           <InputGroup label="Wire Length (H)" val={data.H} k="H" unit="m" />
           <InputGroup label="Radius Disk (R)" val={data.R} k="R" unit="m" />
           <InputGroup label="Radius Top (r)" val={data.r} k="r" unit="m" />

           <div className="col-span-2 pb-2 border-b border-slate-100 font-medium text-slate-700 mt-2">Measurements</div>
           <InputGroup label="Period Empty (T₀)" val={data.T0} k="T0" unit="s" />
           <InputGroup label="Period Loaded (T₁)" val={data.T1} k="T1" unit="s" />
           <InputGroup label="Object Mass (m₁)" val={data.m1} k="m1" unit="kg" />
        </div>

        {results && (
          <div className="mt-8 bg-slate-900 text-white p-6 rounded-lg">
            <h3 className="text-sm text-slate-400 uppercase tracking-wider mb-4">Calculation Results</h3>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <div className="text-2xl font-mono font-bold text-green-400">{results.I0.toFixed(5)}</div>
                <div className="text-xs text-slate-400 mt-1">I₀ (Disk Inertia) [kg·m²]</div>
              </div>
              <div>
                <div className="text-2xl font-mono font-bold text-blue-400">{results.I1.toFixed(5)}</div>
                <div className="text-xs text-slate-400 mt-1">I₁ (Object Inertia) [kg·m²]</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Report Section */}
      <div className="flex flex-col h-full">
        <div className="bg-white flex-1 p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <FileText className="w-5 h-5 text-purple-600" />
              AI Lab Report
            </h2>
            <button 
              onClick={handleGenerateReport}
              disabled={loading || !results}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-white transition-all
                ${loading || !results ? 'bg-slate-300 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700 shadow-lg shadow-purple-200'}`}
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin"/> : <Save className="w-4 h-4" />}
              Generate Analysis
            </button>
          </div>

          <div className="flex-1 bg-slate-50 rounded-lg p-4 border border-slate-100 overflow-y-auto font-serif leading-relaxed text-slate-700">
            {report ? (
              <div className="prose prose-sm max-w-none">
                 {/* Simple formatting for markdown-like text */}
                 {report.split('\n').map((line, i) => (
                   <p key={i} className={`mb-2 ${line.startsWith('#') ? 'font-bold text-slate-900 text-lg' : ''}`}>
                     {line.replace(/#/g, '')}
                   </p>
                 ))}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 text-sm text-center">
                <FileText className="w-12 h-12 mb-3 opacity-20" />
                <p>Enter data and calculate results<br/>to generate an AI-powered analysis.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};