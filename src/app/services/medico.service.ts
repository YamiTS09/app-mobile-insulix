import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MedicoService {
  private http = inject(HttpClient);
  private readonly API_URL = `${environment.apiUrl}/users`;

  /**
   * Obtener la lista de pacientes de un médico específico
   * Endpoint: GET /users/paciente?medico_id={id}
   */
  getMisPacientes(medicoId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.API_URL}/users/paciente`, {
      params: { medico_id: medicoId }
    });
  }

  /**
   * Obtener el detalle de un paciente específico
   * Endpoint: GET /users/paciente/{id}
   */
  getDetallePaciente(pacienteId: string): Observable<any> {
    return this.http.get<any>(`${this.API_URL}/paciente/${pacienteId}`);
  }

  /**
   * Registrar un nuevo paciente (Alta de pacientes)
   * Endpoint: POST /users/paciente
   */
  registrarPaciente(datosPaciente: any): Observable<any> {
    return this.http.post(`${this.API_URL}/paciente`, datosPaciente);
  }

  /**
   * Actualizar datos de un paciente
   * (Asumiendo que tu API usa PUT para actualizar)
   */
  actualizarPaciente(pacienteId: string, datos: any): Observable<any> {
    return this.http.put(`${this.API_URL}/paciente/${pacienteId}`, datos);
  }

  /**
   * Eliminar un paciente de la lista del médico
   */
  eliminarPaciente(pacienteId: string): Observable<any> {
    return this.http.delete(`${this.API_URL}/paciente/${pacienteId}`);
  }

  /**
   * Obtener/Actualizar perfil del propio médico
   * Endpoint: GET /users/medico/{id}
   */
  getPerfilMedico(medicoId: string): Observable<any> {
    return this.http.get(`${this.API_URL}/medico/${medicoId}`);
  }
}