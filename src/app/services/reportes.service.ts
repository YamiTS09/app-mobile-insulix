import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface GlucoseReading {
  lectura_id: string;
  paciente_id: string;
  sensor_id: string | null;
  valor_mgdl: number;
  fecha_hora: string;
  fecha_registro: string;
  es_simulado: boolean;
  origen: 'SENSOR' | 'MEDICO' | 'PACIENTE' | 'SIMULADOR';
}

export interface CurrentGlucoseResponse {
  medicion: GlucoseReading | null;
}

@Injectable({
  providedIn: 'root'
})
export class ReportesService {
  private http = inject(HttpClient);
  private readonly API_URL = environment.reportesUrl;

  agregarLecturaGlucosa(lectura: any): Observable<any> {
    return this.http.post(`${this.API_URL}/glucosa`, lectura);
  }

  agregarLecturaSimulada(): Observable<GlucoseReading> {
    return this.http.post<GlucoseReading>(`${this.API_URL}/glucosa/simulada`, {});
  }

  getHistorialGlucosa(
    pacienteId: string | number,
    startDate?: string,
    endDate?: string
  ): Observable<GlucoseReading[]> {
    let params: any = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    return this.http.get<GlucoseReading[]>(`${this.API_URL}/glucosa/${pacienteId}`, { params });
  }

  getCurrentGlucose(pacienteId: string): Observable<CurrentGlucoseResponse> {
    return this.http.get<CurrentGlucoseResponse>(`${this.API_URL}/glucosa/${pacienteId}/actual`);
  }

  updateLectura(id: string, lectura: any): Observable<any> {
    return this.http.put(`${this.API_URL}/glucosa/${id}`, lectura);
  }

  getGraficas(pacienteId: string | number): Observable<any> {
    return this.http.get<any>(`${this.API_URL}/graficas`, { params: { paciente_id: pacienteId } });
  }
}
