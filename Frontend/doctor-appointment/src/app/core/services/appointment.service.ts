import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse, Appointment, CreateAppointment, PagedResult } from '../models/models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AppointmentService {
  private apiUrl = `${environment.apiUrl}/appointments`;

  constructor(private http: HttpClient) {}

  getAll(page = 1, pageSize = 10, status?: number): Observable<ApiResponse<PagedResult<Appointment>>> {
    let params = new HttpParams().set('page', page).set('pageSize', pageSize);
    if (status !== undefined) params = params.set('status', status);
    return this.http.get<ApiResponse<PagedResult<Appointment>>>(this.apiUrl, { params });
  }

  getMyAppointments(): Observable<ApiResponse<Appointment[]>> {
    return this.http.get<ApiResponse<Appointment[]>>(`${this.apiUrl}/my-appointments`);
  }

  getById(id: string): Observable<ApiResponse<Appointment>> {
    return this.http.get<ApiResponse<Appointment>>(`${this.apiUrl}/${id}`);
  }

  create(dto: CreateAppointment): Observable<ApiResponse<Appointment>> {
    return this.http.post<ApiResponse<Appointment>>(this.apiUrl, dto);
  }

  updateStatus(id: string, status: number): Observable<ApiResponse<Appointment>> {
    return this.http.put<ApiResponse<Appointment>>(`${this.apiUrl}/${id}/status`, { status });
  }
}
