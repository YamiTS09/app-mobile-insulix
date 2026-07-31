import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { GlucoseMeasurement } from '../models/glucose-measurement.interface';

const DATA: GlucoseMeasurement[] = [
  { hour: '00:00', value: 115 }, { hour: '01:00', value: 110 },
  { hour: '02:00', value: 103 }, { hour: '03:00', value: 96 },
  { hour: '04:00', value: 90 }, { hour: '05:00', value: 97 },
  { hour: '06:00', value: 108 }, { hour: '07:00', value: 125 },
  { hour: '08:00', value: 145 }, { hour: '09:00', value: 166 },
  { hour: '10:00', value: 158 }, { hour: '11:00', value: 153 },
  { hour: '12:00', value: 163 }, { hour: '13:00', value: 188 },
  { hour: '14:00', value: 207 }, { hour: '15:00', value: 218 },
  { hour: '16:00', value: 197 }, { hour: '17:00', value: 176 },
  { hour: '18:00', value: 160 }, { hour: '19:00', value: 149 },
  { hour: '20:00', value: 145 }, { hour: '21:00', value: 137 },
  { hour: '22:00', value: 123 }, { hour: '23:00', value: 108 },
  { hour: '24:00', value: 101 }
];

@Injectable({ providedIn: 'root' })
export class GlucoseSimulationService {
  // Puede reemplazarse por this.http.get<GlucoseMeasurement[]>(url).
  getMeasurements(): Observable<GlucoseMeasurement[]> {
    return of(DATA.map(item => ({ ...item })));
  }
}
