import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse, Doctor, CreateDoctor, UpdateDoctor, PagedResult } from '../models/models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class DoctorService {
  private apiUrl = `${environment.apiUrl}/doctors`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<ApiResponse<Doctor[]>> {
    return this.http.get<ApiResponse<Doctor[]>>(this.apiUrl);
  }

  getById(id: string): Observable<ApiResponse<Doctor>> {
    return this.http.get<ApiResponse<Doctor>>(`${this.apiUrl}/${id}`);
  }

  search(specialization?: string, hospitalId?: string, location?: string, page = 1, pageSize = 20): Observable<ApiResponse<PagedResult<Doctor>>> {
    let params = new HttpParams().set('page', page).set('pageSize', pageSize);
    if (specialization) params = params.set('specialization', specialization);
    if (hospitalId) params = params.set('hospitalId', hospitalId);
    if (location) params = params.set('location', location);
    return this.http.get<ApiResponse<PagedResult<Doctor>>>(`${this.apiUrl}/search`, { params });
  }

  searchNearby(lat: number, lng: number, radius = 10, specialization?: string, hospitalId?: string, sortBy = 'distance', page = 1, pageSize = 20): Observable<ApiResponse<PagedResult<Doctor>>> {
    let params = new HttpParams()
      .set('lat', lat).set('lng', lng).set('radius', radius)
      .set('sortBy', sortBy).set('page', page).set('pageSize', pageSize);
    if (specialization) params = params.set('specialization', specialization);
    if (hospitalId) params = params.set('hospitalId', hospitalId);
    return this.http.get<ApiResponse<PagedResult<Doctor>>>(`${this.apiUrl}/nearby`, { params });
  }

  create(dto: CreateDoctor): Observable<ApiResponse<Doctor>> {
    return this.http.post<ApiResponse<Doctor>>(this.apiUrl, dto);
  }

  update(id: string, dto: UpdateDoctor): Observable<ApiResponse<Doctor>> {
    return this.http.put<ApiResponse<Doctor>>(`${this.apiUrl}/${id}`, dto);
  }

  delete(id: string): Observable<ApiResponse<string>> {
    return this.http.delete<ApiResponse<string>>(`${this.apiUrl}/${id}`);
  }
}
