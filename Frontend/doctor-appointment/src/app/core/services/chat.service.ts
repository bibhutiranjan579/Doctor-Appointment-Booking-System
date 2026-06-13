import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse, ChatContact, ChatMessage } from '../models/models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ChatService {
  private apiUrl = `${environment.apiUrl}/chat`;

  constructor(private http: HttpClient) {}

  sendMessage(receiverId: string, message: string): Observable<ApiResponse<ChatMessage>> {
    return this.http.post<ApiResponse<ChatMessage>>(`${this.apiUrl}/send`, { receiverId, message });
  }

  getConversation(otherUserId: string, page = 1, pageSize = 50): Observable<ApiResponse<ChatMessage[]>> {
    const params = new HttpParams().set('page', page).set('pageSize', pageSize);
    return this.http.get<ApiResponse<ChatMessage[]>>(`${this.apiUrl}/conversation/${otherUserId}`, { params });
  }

  getContacts(): Observable<ApiResponse<ChatContact[]>> {
    return this.http.get<ApiResponse<ChatContact[]>>(`${this.apiUrl}/contacts`);
  }
}
