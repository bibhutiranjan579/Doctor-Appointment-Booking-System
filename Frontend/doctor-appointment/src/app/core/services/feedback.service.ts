import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse, Feedback, CreateFeedback, DoctorRatingSummary, AdminFeedbackAnalytics } from '../models/models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class FeedbackService {
  private apiUrl = `${environment.apiUrl}/feedbacks`;

  constructor(private http: HttpClient) {}

  create(dto: CreateFeedback): Observable<ApiResponse<Feedback>> {
    return this.http.post<ApiResponse<Feedback>>(this.apiUrl, dto);
  }

  getDoctorSummary(doctorId: string): Observable<ApiResponse<DoctorRatingSummary>> {
    return this.http.get<ApiResponse<DoctorRatingSummary>>(`${this.apiUrl}/doctor/${doctorId}`);
  }

  getMyFeedbacks(): Observable<ApiResponse<Feedback[]>> {
    return this.http.get<ApiResponse<Feedback[]>>(`${this.apiUrl}/my`);
  }

  getDoctorViewFeedback(): Observable<ApiResponse<DoctorRatingSummary>> {
    return this.http.get<ApiResponse<DoctorRatingSummary>>(`${this.apiUrl}/doctor-view`);
  }

  getAdminFeedbacks(): Observable<ApiResponse<Feedback[]>> {
    return this.http.get<ApiResponse<Feedback[]>>(`${this.apiUrl}/admin`);
  }

  getAdminAnalytics(): Observable<ApiResponse<AdminFeedbackAnalytics>> {
    return this.http.get<ApiResponse<AdminFeedbackAnalytics>>(`${this.apiUrl}/admin/analytics`);
  }

  moderate(id: string, status: string): Observable<ApiResponse<Feedback>> {
    return this.http.put<ApiResponse<Feedback>>(`${this.apiUrl}/${id}/moderate`, { status });
  }
}
