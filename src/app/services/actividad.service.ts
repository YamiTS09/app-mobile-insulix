import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ActividadService {
  private http = inject(HttpClient);
  private readonly API_URL = environment.actividadUrl;

  getActividadesCatalogo(): Observable<any[]> {
    return this.http.get<any[]>(`${this.API_URL}/catalogo`);
  }

  createActividadCatalogo(actividad: any): Observable<any> {
    return this.http.post(`${this.API_URL}/catalogo`, actividad);
  }

  updateActividadCatalogo(id: string, actividad: any): Observable<any> {
    return this.http.put(`${this.API_URL}/catalogo/${id}`, actividad);
  }

  deleteActividadCatalogo(id: string): Observable<any> {
    return this.http.delete(`${this.API_URL}/catalogo/${id}`);
  }

  getAsignaciones(pacienteId: string | number): Observable<any[]> {
    return this.http.get<any[]>(`${this.API_URL}/asignaciones`, { params: { paciente_id: pacienteId } });
  }

  asignarActividad(asignacion: any): Observable<any> {
    return this.http.post(`${this.API_URL}/asignaciones`, asignacion);
  }

  deleteAsignacion(id: string): Observable<any> {
    return this.http.delete(`${this.API_URL}/asignaciones/${id}`);
  }
}
