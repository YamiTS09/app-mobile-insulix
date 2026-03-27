import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ReportesService {
  private http = inject(HttpClient);
  private readonly API_URL = environment.reportesUrl;

  agregarLecturaGlucosa(lectura: any): Observable<any> {
    return this.http.post(`${this.API_URL}/glucosa`, lectura);
  }

  getHistorialGlucosa(pacienteId: string | number, startDate?: string, endDate?: string): Observable<any[]> {
    let params: any = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    return this.http.get<any[]>(`${this.API_URL}/glucosa/${pacienteId}`, { params });
  }

  updateLectura(id: string, lectura: any): Observable<any> {
    return this.http.put(`${this.API_URL}/glucosa/${id}`, lectura);
  }

  getGraficas(pacienteId: string | number): Observable<any> {
    return this.http.get<any>(`${this.API_URL}/graficas`, { params: { paciente_id: pacienteId } });
  }
}
