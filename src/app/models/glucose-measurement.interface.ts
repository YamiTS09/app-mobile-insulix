export type GlucoseStatus = 'Bajo' | 'Objetivo' | 'Alto';

export interface GlucoseMeasurement {
  hour: string;
  value: number;
  status?: GlucoseStatus;
}
