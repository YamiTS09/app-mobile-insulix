import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export type MealCategory = 'Desayuno' | 'Comida' | 'Cena' | 'Colación';
export type MealPlanStatus = 'BORRADOR' | 'PUBLICADO';
export type DatabaseNumeric = number | string;

export interface CatalogDish {
  catalogo_platillo_id: string;
  medico_id: string;
  nombre: string;
  descripcion: string | null;
  imagen_url: string | null;
  categoria_sugerida: MealCategory | null;
  porcion_cantidad: DatabaseNumeric;
  porcion_unidad: string;
  calorias_kcal: DatabaseNumeric;
  carbohidratos_g: DatabaseNumeric | null;
  proteinas_g: DatabaseNumeric | null;
  grasas_g: DatabaseNumeric | null;
  azucares_g: DatabaseNumeric | null;
  fibra_g: DatabaseNumeric | null;
  colesterol_mg: DatabaseNumeric | null;
  bebida_nombre: string | null;
  bebida_cantidad_ml: DatabaseNumeric | null;
  bebida_notas: string | null;
  pacientes_asignados?: number;
}

export interface PlannedDish {
  detalle_id: string;
  plan_id: string;
  catalogo_platillo_id: string | null;
  nombre_platillo: string;
  descripcion: string | null;
  imagen_url: string | null;
  fecha: string;
  tipo_comida: MealCategory;
  hora: string;
  comentario: string | null;
  porcion_cantidad: DatabaseNumeric;
  porcion_unidad: string;
  calorias_kcal: DatabaseNumeric;
  carbohidratos_g: DatabaseNumeric | null;
  proteinas_g: DatabaseNumeric | null;
  grasas_g: DatabaseNumeric | null;
  azucares_g: DatabaseNumeric | null;
  fibra_g: DatabaseNumeric | null;
  colesterol_mg: DatabaseNumeric | null;
  bebida_nombre: string | null;
  bebida_cantidad_ml: DatabaseNumeric | null;
  bebida_notas: string | null;
}

export interface WeeklyMealPlan {
  plan_id: string;
  paciente_id: string;
  medico_id: string;
  fecha_inicio: string;
  fecha_fin: string;
  estado: MealPlanStatus;
  observaciones: string | null;
  comidas: PlannedDish[];
}

@Injectable({ providedIn: 'root' })
export class DietasService {
  private http = inject(HttpClient);
  private readonly API_URL = environment.dietasUrl;

  getDietasCatalogo(): Observable<CatalogDish[]> {
    return this.http.get<CatalogDish[]>(`${this.API_URL}/catalogo`);
  }

  createDietaCatalogo(dieta: Partial<CatalogDish>): Observable<CatalogDish> {
    return this.http.post<CatalogDish>(`${this.API_URL}/catalogo`, dieta);
  }

  updateDietaCatalogo(id: string, dieta: Partial<CatalogDish>): Observable<CatalogDish> {
    return this.http.put<CatalogDish>(`${this.API_URL}/catalogo/${id}`, dieta);
  }

  deleteDietaCatalogo(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.API_URL}/catalogo/${id}`);
  }

  uploadCatalogImage(image: File): Observable<{ imagen_url: string }> {
    const formData = new FormData();
    formData.append('imagen', image, image.name);
    return this.http.post<{ imagen_url: string }>(`${this.API_URL}/catalogo/imagen`, formData);
  }

  getWeeklyPlan(pacienteId: string, fechaInicio: string): Observable<WeeklyMealPlan | null> {
    const params = new HttpParams()
      .set('paciente_id', pacienteId)
      .set('fecha_inicio', fechaInicio);
    return this.http.get<WeeklyMealPlan | null>(`${this.API_URL}/planes`, { params });
  }

  createWeeklyPlan(payload: { paciente_id: string; fecha_inicio: string }): Observable<WeeklyMealPlan> {
    return this.http.post<WeeklyMealPlan>(`${this.API_URL}/planes`, payload);
  }

  addDishToPlan(planId: string, payload: {
    catalogo_platillo_id: string;
    fecha: string;
    tipo_comida: MealCategory;
    hora: string;
    comentario?: string | null;
  }): Observable<PlannedDish> {
    return this.http.post<PlannedDish>(`${this.API_URL}/planes/${planId}/comidas`, payload);
  }

  removeDishFromPlan(planId: string, detalleId: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.API_URL}/planes/${planId}/comidas/${detalleId}`);
  }

  setPlanStatus(planId: string, estado: MealPlanStatus): Observable<WeeklyMealPlan> {
    return this.http.patch<WeeklyMealPlan>(`${this.API_URL}/planes/${planId}`, { estado });
  }

  // El reporte médico todavía consume esta lista de compatibilidad.
  getAsignaciones(pacienteId: string | number): Observable<any[]> {
    return this.http.get<any[]>(`${this.API_URL}/asignaciones`, {
      params: { paciente_id: String(pacienteId) }
    });
  }

  deleteAsignacion(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.API_URL}/asignaciones/${id}`);
  }
}
