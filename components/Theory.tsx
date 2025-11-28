import React from 'react';
import { Microscope, Activity, Cpu, Eye } from 'lucide-react';

export const Theory: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Trifilar Pendulum System Design</h1>
        <p className="text-slate-500 text-lg">Detailed system architecture for period measurement and velocity estimation.</p>
      </div>

      {/* Sensor Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-100 rounded-lg text-blue-600"><Eye className="w-5 h-5"/></div>
            <h3 className="text-xl font-bold text-slate-800">1. Sensor Selection</h3>
          </div>
          <div className="space-y-4 text-slate-600">
            <p><strong className="text-slate-800">Recommended:</strong> Transmissive Photogate (Infrared Interrupter).</p>
            <p><strong className="text-slate-800">Reasoning:</strong></p>
            <ul className="list-disc pl-5 space-y-2 text-sm">
              <li><strong>Non-contact:</strong> Does not introduce friction (unlike potentiometers).</li>
              <li><strong>Precision:</strong> High timing accuracy (microseconds) essential for period $T$ calculation, as {`$I \\propto T^2$`}.</li>
              <li><strong>Cost:</strong> Very low (&lt; $2 USD for typical IR breakdown modules).</li>
              <li><strong>Simplicity:</strong> Digital output (High/Low) requires minimal signal processing compared to accelerometers which suffer from drift and noise integration.</li>
            </ul>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-amber-100 rounded-lg text-amber-600"><Cpu className="w-5 h-5"/></div>
            <h3 className="text-xl font-bold text-slate-800">2. Installation & Acquisition</h3>
          </div>
          <div className="space-y-4 text-slate-600">
             <p><strong className="text-slate-800">Placement:</strong> Install the photogate at the equilibrium position (where velocity is max).</p>
             <p><strong className="text-slate-800">Trigger Mechanism:</strong> Attach a narrow vertical "flag" (width {`$d \\approx 2-5$`}mm) to the edge of the lower disk. It must pass through the photogate beam.</p>
             <p><strong className="text-slate-800">Sampling Rate:</strong></p>
             <ul className="list-disc pl-5 space-y-2 text-sm">
               <li>The microcontroller (e.g., Arduino/ESP32) should use <strong>Hardware Interrupts</strong>.</li>
               <li>Do not use polling loops to ensure microsecond precision.</li>
               <li>Timer resolution should be at least 10µs.</li>
             </ul>
          </div>
        </div>
      </div>

      {/* Algorithms */}
      <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200">
         <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-green-100 rounded-lg text-green-600"><Activity className="w-5 h-5"/></div>
            <h3 className="text-xl font-bold text-slate-800">3. Data Processing Algorithms</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h4 className="font-bold text-slate-700 mb-2">A. Period Calculation ($T$)</h4>
              <p className="text-sm text-slate-600 mb-4 leading-relaxed">
                The pendulum passes the equilibrium twice per full oscillation.
                1. Detect Rising Edge (Beam Broken). Record {`$t_1$`}.
                2. Wait for next Rising Edge. Record {`$t_2$`}.
                3. Wait for third Rising Edge. Record {`$t_3$`}.
                <br/><br/>
                Full Period {`$T = t_3 - t_1$`}.
                <br/>
                <strong>Improvement:</strong> Average over $N=30$ cycles:
                {`$$T_{avg} = \\frac{t_{last} - t_{first}}{N}$$`}
              </p>
            </div>
            
            <div>
              <h4 className="font-bold text-slate-700 mb-2">B. Instantaneous Velocity ($v$)</h4>
              <p className="text-sm text-slate-600 mb-4 leading-relaxed">
                Using the flag width $d$ (known constant):
                When flag passes gate:
                1. {`$t_{start}$`}: Beam Break.
                2. {`$t_{end}$`}: Beam Restore.
                3. {`$\\Delta t_{gate} = t_{end} - t_{start}$`}.
                <br/><br/>
                Velocity at equilibrium:
                {`$$v \\approx \\frac{d}{\\Delta t_{gate}}$$`}
                (Valid when $d$ is very small compared to arc length).
              </p>
            </div>
          </div>

          <div className="mt-8 p-4 bg-slate-50 border border-slate-200 rounded-lg">
             <h4 className="font-bold text-slate-700 mb-4">C. System Schematic</h4>
             <svg className="w-full h-48" viewBox="0 0 600 200">
                {/* Microcontroller */}
                <rect x="50" y="50" width="100" height="120" rx="8" fill="#334155" />
                <text x="100" y="115" fill="white" fontSize="14" textAnchor="middle">MCU (ESP32)</text>
                
                {/* Connection Line */}
                <line x1="150" y1="100" x2="250" y2="100" stroke="#94a3b8" strokeWidth="2" strokeDasharray="5,5" />
                
                {/* Photogate */}
                <g transform="translate(250, 60)">
                  <path d="M0,0 L0,80 L30,80 L30,0" fill="none" stroke="#2563eb" strokeWidth="4" />
                  <circle cx="15" cy="40" r="5" fill="#ef4444" />
                  <text x="15" y="-10" fill="#2563eb" fontSize="12" textAnchor="middle">Photogate</text>
                </g>

                {/* Disk Flag */}
                <g transform="translate(265, 80)">
                   <rect x="-2" y="0" width="4" height="40" fill="#0f172a" />
                   <text x="0" y="55" fill="#0f172a" fontSize="12" textAnchor="middle">Flag</text>
                </g>

                {/* Data Flow */}
                <path d="M150 120 L400 120" stroke="#cbd5e1" strokeWidth="2" markerEnd="url(#arrow)" />
                <rect x="400" y="50" width="150" height="120" rx="8" fill="#fff" stroke="#cbd5e1" />
                <text x="475" y="100" fill="#334155" fontSize="14" textAnchor="middle">PC / Web App</text>
                <text x="475" y="120" fill="#64748b" fontSize="10" textAnchor="middle">(Visualization)</text>

                 <defs>
                  <marker id="arrow" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
                    <path d="M0,0 L0,6 L9,3 z" fill="#cbd5e1" />
                  </marker>
                </defs>
             </svg>
          </div>
      </div>
    </div>
  );
};