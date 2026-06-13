import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse, Hospital, CreateHospital } from '../models/models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class HospitalService {
  private apiUrl = `${environment.apiUrl}/hospitals`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<ApiResponse<Hospital[]>> {
    return this.http.get<ApiResponse<Hospital[]>>(this.apiUrl);
  }

  getById(id: string): Observable<ApiResponse<Hospital>> {
    return this.http.get<ApiResponse<Hospital>>(`${this.apiUrl}/${id}`);
  }

  searchNearby(lat: number, lng: number, radius = 10): Observable<ApiResponse<Hospital[]>> {
    const params = new HttpParams().set('lat', lat).set('lng', lng).set('radius', radius);
    return this.http.get<ApiResponse<Hospital[]>>(`${this.apiUrl}/nearby`, { params });
  }

  create(dto: CreateHospital): Observable<ApiResponse<Hospital>> {
    return this.http.post<ApiResponse<Hospital>>(this.apiUrl, dto);
  }

  update(id: string, dto: CreateHospital): Observable<ApiResponse<Hospital>> {
    return this.http.put<ApiResponse<Hospital>>(`${this.apiUrl}/${id}`, dto);
  }

  delete(id: string): Observable<ApiResponse<string>> {
    return this.http.delete<ApiResponse<string>>(`${this.apiUrl}/${id}`);
  }
}
