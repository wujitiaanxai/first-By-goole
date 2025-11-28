// Simulation Parameters
export interface SimParams {
  mass: number; // kg (Disk mass)
  radiusDisk: number; // m (R)
  radiusSuspension: number; // m (r)
  length: number; // m (H)
  initialAngle: number; // degrees
}

// Data Record for Analysis
export interface ExperimentRecord {
  id: string;
  timestamp: number;
  T0: number; // Period of empty disk
  T1: number; // Period with object
  m0: number; // Mass of disk (kg)
  m1: number; // Mass of object (kg)
  R: number; // Radius of suspension on disk (m)
  r: number; // Radius of suspension on top (m)
  H: number; // Vertical length (m)
  calculatedI0: number; // Moment of Inertia (Disk)
  calculatedI1: number; // Moment of Inertia (Object)
}

export enum AppMode {
  SIMULATION = 'SIMULATION',
  ANALYSIS = 'ANALYSIS',
  THEORY = 'THEORY'
}

export interface GraphPoint {
  time: number;
  angle: number;
  velocity: number;
}