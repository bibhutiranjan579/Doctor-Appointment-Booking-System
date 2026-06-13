import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ChatConversation, MedAiChatRequest, MedAiChatResponse, SendMessageResponse } from './medai-chat.model';
import { AuthService } from '../../../core/services/auth.service';

@Injectable({ providedIn: 'root' })
export class MedaiChatService {
  private apiUrl = `${environment.apiUrl}/medai`;

  constructor(private http: HttpClient, private authService: AuthService) {}

  get isLoggedIn(): boolean {
    return this.authService.isLoggedIn;
  }

  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  // ==================== GUEST (no auth) ====================

  sendGuestMessage(message: string, history: { role: string; content: string; timestamp: string }[]): Observable<{ success: boolean; data: MedAiChatResponse }> {
    const request: MedAiChatRequest = { message, history: history.slice(-10) };
    return this.http.post<{ success: boolean; data: MedAiChatResponse }>(`${this.apiUrl}/chat`, request);
  }

  // ==================== AUTHENTICATED ====================

  getConversations(): Observable<{ success: boolean; data: ChatConversation[] }> {
    return this.http.get<{ success: boolean; data: ChatConversation[] }>(
      `${this.apiUrl}/conversations`, { headers: this.getAuthHeaders() }
    );
  }

  getConversation(id: string): Observable<{ success: boolean; data: { id: string; title: string; createdAt: string; messages: any[] } }> {
    return this.http.get<any>(
      `${this.apiUrl}/conversations/${id}`, { headers: this.getAuthHeaders() }
    );
  }

  createConversation(): Observable<{ success: boolean; data: { id: string; title: string; createdAt: string } }> {
    return this.http.post<any>(
      `${this.apiUrl}/conversations`, {}, { headers: this.getAuthHeaders() }
    );
  }

  sendMessageInConversation(conversationId: string, message: string): Observable<{ success: boolean; data: SendMessageResponse }> {
    return this.http.post<{ success: boolean; data: SendMessageResponse }>(
      `${this.apiUrl}/conversations/${conversationId}/messages`,
      { message },
      { headers: this.getAuthHeaders() }
    );
  }

  renameConversation(id: string, title: string): Observable<any> {
    return this.http.put(
      `${this.apiUrl}/conversations/${id}/rename`,
      { title },
      { headers: this.getAuthHeaders() }
    );
  }

  deleteConversation(id: string): Observable<any> {
    return this.http.delete(
      `${this.apiUrl}/conversations/${id}`,
      { headers: this.getAuthHeaders() }
    );
  }
}
