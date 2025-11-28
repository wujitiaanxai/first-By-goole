import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Play, Pause, RotateCcw, Activity } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { SimParams, GraphPoint } from '../types';

const INITIAL_PARAMS: SimParams = {
  mass: 1.5,
  radiusDisk: 0.10,
  radiusSuspension: 0.05,
  length: 0.50,
  initialAngle: 5, // degrees
};

// Physics Constants
const G = 9.81;

export const Simulation: React.FC = () => {
  const [params, setParams] = useState<SimParams>(INITIAL_PARAMS);
  const [isPlaying, setIsPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [data, setData] = useState<GraphPoint[]>([]);
  
  // Ref for animation loop to avoid dependency cycles
  const requestRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  
  // Calculate Theoretical Period based on physical parameters
  // Formula: T = 2*pi * sqrt( (H * I) / (m * g * R * r) )
  // Assuming Disk Inertia I = 0.5 * m * R_disk^2 (Here we assume the disk radius = suspension radius R for simplicity in visualization, or use distinct)
  // Let's use R as the suspension radius on the disk.
  const calculatePeriod = useCallback(() => {
    // I_disk approx 0.5 * m * R^2. 
    // Note: In trifilar, R is usually radius of suspension points on disk, r is radius on top.
    const I = 0.5 * params.mass * Math.pow(params.radiusDisk, 2); 
    const numerator = params.length * I;
    const denominator = params.mass * G * params.radiusDisk * params.radiusSuspension;
    return 2 * Math.PI * Math.sqrt(numerator / denominator);
  }, [params]);

  const period = calculatePeriod();
  const omega = (2 * Math.PI) / period;

  const animate = (timestamp: number) => {
    if (!startTimeRef.current) startTimeRef.current = timestamp;
    
    // Elapsed time in seconds
    const elapsed = (timestamp - startTimeRef.current) / 1000; 
    
    // Simulate Simple Harmonic Motion: theta(t) = theta_max * cos(omega * t)
    const thetaMaxRad = params.initialAngle * (Math.PI / 180);
    const currentAngleRad = thetaMaxRad * Math.cos(omega * elapsed);
    const currentAngleDeg = currentAngleRad * (180 / Math.PI);
    
    // Tangential Velocity v = omega * R * sin(omega * t) (approx at R)
    // Angular velocity d(theta)/dt = -theta_max * omega * sin(omega * t)
    const angularVel = -thetaMaxRad * omega * Math.sin(omega * elapsed);

    setTime(elapsed);
    lastTimeRef.current = elapsed;

    // Update Graph Data (throttle slightly or keep short buffer)
    setData(prev => {
      const newPoint = {
        time: parseFloat(elapsed.toFixed(2)),
        angle: parseFloat(currentAngleDeg.toFixed(2)),
        velocity: parseFloat(angularVel.toFixed(3))
      };
      const newData = [...prev, newPoint];
      if (newData.length > 100) newData.shift(); // Keep last 100 points
      return newData;
    });

    requestRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    if (isPlaying) {
      if (lastTimeRef.current > 0 && !startTimeRef.current) {
         // Resume logic would go here, simplified to reset for now or smooth continue requires offset math
         startTimeRef.current = performance.now() - (lastTimeRef.current * 1000);
      }
      requestRef.current = requestAnimationFrame(animate);
    } else {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      startTimeRef.current = null; // Reset start reference on stop for this simple demo
    }
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlaying, params]); // Re-calc if params change

  const handleReset = () => {
    setIsPlaying(false);
    setTime(0);
    setData([]);
    lastTimeRef.current = 0;
    startTimeRef.current = null;
  };

  // Visualizer Components
  const diskRotation = data.length > 0 ? data[data.length - 1].angle : params.initialAngle;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
      {/* Controls & Params */}
      <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-sm border border-slate-200 overflow-y-auto">
        <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5 text-blue-600" />
          System Parameters
        </h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Mass (m) [kg]</label>
            <input 
              type="range" min="0.5" max="5.0" step="0.1"
              value={params.mass}
              onChange={(e) => { handleReset(); setParams({...params, mass: parseFloat(e.target.value)});} }
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="text-right text-xs text-slate-500">{params.mass} kg</div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Suspension Radius (R) [m]</label>
            <input 
              type="range" min="0.05" max="0.25" step="0.01"
              value={params.radiusDisk}
              onChange={(e) => { handleReset(); setParams({...params, radiusDisk: parseFloat(e.target.value)});} }
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="text-right text-xs text-slate-500">{params.radiusDisk} m</div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Wire Length (H) [m]</label>
            <input 
              type="range" min="0.3" max="1.5" step="0.05"
              value={params.length}
              onChange={(e) => { handleReset(); setParams({...params, length: parseFloat(e.target.value)});} }
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="text-right text-xs text-slate-500">{params.length} m</div>
          </div>
          
           <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Initial Angle [deg]</label>
            <input 
              type="number" min="1" max="10"
              value={params.initialAngle}
              onChange={(e) => { handleReset(); setParams({...params, initialAngle: parseFloat(e.target.value)});} }
              className="w-full p-2 border border-slate-300 rounded text-sm"
            />
          </div>
        </div>

        <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-100">
          <p className="text-sm text-blue-800 font-semibold">Theoretical Results:</p>
          <div className="flex justify-between mt-2 text-sm text-blue-900">
            <span>Period (T):</span>
            <span className="font-mono">{period.toFixed(4)} s</span>
          </div>
          <div className="flex justify-between mt-1 text-sm text-blue-900">
            <span>Freq (f):</span>
            <span className="font-mono">{(1/period).toFixed(4)} Hz</span>
          </div>
        </div>

        <div className="mt-6 flex gap-2">
          <button 
            onClick={() => setIsPlaying(!isPlaying)}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg font-medium transition-colors ${isPlaying ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
          >
            {isPlaying ? <><Pause className="w-4 h-4"/> Pause</> : <><Play className="w-4 h-4"/> Start</>}
          </button>
          <button 
            onClick={handleReset}
            className="px-4 py-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Visualizer & Graphs */}
      <div className="lg:col-span-2 flex flex-col gap-6">
        
        {/* Top View Animation */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 h-64 relative flex items-center justify-center overflow-hidden">
          <div className="absolute top-2 left-2 text-xs text-slate-400 font-mono">TOP VIEW</div>
          
          {/* Static Outer Ring (Suspension Points at top) */}
          <div className="w-48 h-48 border-2 border-dashed border-slate-300 rounded-full absolute flex items-center justify-center">
            {/* Top wire points */}
            {[0, 120, 240].map(deg => (
               <div key={deg} className="absolute w-2 h-2 bg-slate-400 rounded-full" 
                    style={{ transform: `rotate(${deg}deg) translate(6rem) rotate(-${deg}deg)` }} />
            ))}
          </div>

          {/* Rotating Disk */}
          <div 
            className="w-64 h-64 border-4 border-slate-800 bg-slate-100/50 rounded-full absolute flex items-center justify-center transition-transform duration-75 ease-linear shadow-lg"
            style={{ 
              transform: `rotate(${diskRotation}deg)`,
              width: `${params.radiusDisk * 400}px`, // Simple scaling
              height: `${params.radiusDisk * 400}px` 
            }}
          >
             {/* Center Marker */}
             <div className="w-2 h-2 bg-red-500 rounded-full absolute" />
             {/* Radius Line */}
             <div className="h-[1px] w-1/2 bg-slate-400 absolute right-0 top-1/2" />
             
             {/* Wire attachment points on disk */}
             {[0, 120, 240].map(deg => (
               <div key={deg} className="absolute w-3 h-3 bg-blue-600 rounded-full border-2 border-white z-10" 
                    style={{ transform: `rotate(${deg}deg) translate(${params.radiusDisk * 200 - 10}px)` }} />
             ))}
          </div>
        </div>

        {/* Real-time Graphs */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex-1 min-h-[300px]">
          <h3 className="text-sm font-semibold text-slate-600 mb-4">Real-time Data: Angle vs Time</h3>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis 
                dataKey="time" 
                label={{ value: 'Time (s)', position: 'insideBottomRight', offset: -5 }} 
                type="number"
                domain={['auto', 'auto']}
                tickFormatter={(val) => val.toFixed(1)}
              />
              <YAxis label={{ value: 'Angle (°)', angle: -90, position: 'insideLeft' }} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                formatter={(val: number) => val.toFixed(2)}
              />
              <Line 
                type="monotone" 
                dataKey="angle" 
                stroke="#2563eb" 
                strokeWidth={2} 
                dot={false}
                isAnimationActive={false} // Performance optimization
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};