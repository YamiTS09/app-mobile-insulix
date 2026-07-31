import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface WeightMeasurement {
  peso_id: string;
  paciente_id: string;
  valor_kg: number | string;
  fecha_medicion: string;
  fecha_registro: string;
  registrado_por: string | null;
  origen: 'MEDICO' | 'PACIENTE';
  registrado_por_nombre?: string | null;
  registrado_por_apellido?: string | null;
}

@Injectable({ providedIn: 'root' })
export class WeightService {
  private readonly http = inject(HttpClient);
  private readonly API_URL = `${environment.apiUrl}/paciente`;

  getCurrentWeight(patientId: string): Observable<{ medicion: WeightMeasurement | null }> {
    return this.http.get<{ medicion: WeightMeasurement | null }>(
      `${this.API_URL}/${patientId}/peso/actual`
    );
  }

  saveWeight(
    patientId: string,
    valueKg: number,
    measuredAt: string
  ): Observable<WeightMeasurement> {
    return this.http.post<WeightMeasurement>(
      `${this.API_URL}/${patientId}/peso`,
      {
        valor_kg: valueKg,
        fecha_medicion: measuredAt
      }
    );
  }
}
