import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DietasService {
  private http = inject(HttpClient);
  private readonly API_URL = environment.dietasUrl;

  getDietasCatalogo(): Observable<any[]> {
    return this.http.get<any[]>(`${this.API_URL}/catalogo`);
  }

  createDietaCatalogo(dieta: any): Observable<any> {
    return this.http.post(`${this.API_URL}/catalogo`, dieta);
  }

  updateDietaCatalogo(id: string, dieta: any): Observable<any> {
    return this.http.put(`${this.API_URL}/catalogo/${id}`, dieta);
  }

  deleteDietaCatalogo(id: string): Observable<any> {
    return this.http.delete(`${this.API_URL}/catalogo/${id}`);
  }

  getAsignaciones(pacienteId: string | number): Observable<any[]> {
    return this.http.get<any[]>(`${this.API_URL}/asignaciones`, { params: { paciente_id: pacienteId } });
  }

  asignarDieta(asignacion: any): Observable<any> {
    return this.http.post(`${this.API_URL}/asignaciones`, asignacion);
  }

  deleteAsignacion(id: string): Observable<any> {
    return this.http.delete(`${this.API_URL}/asignaciones/${id}`);
  }
}
