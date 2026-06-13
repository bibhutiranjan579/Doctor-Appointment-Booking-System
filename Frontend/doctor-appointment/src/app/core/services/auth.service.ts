import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { ApiResponse, AuthResponse, LoginRequest, RegisterRequest } from '../models/models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;
  private currentUserSubject = new BehaviorSubject<AuthResponse | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {
    // Use sessionStorage (per-tab) to avoid multi-tab token conflicts
    const stored = sessionStorage.getItem('currentUser');
    if (stored) {
      const user = JSON.parse(stored);
      if (this.isTokenExpired(user.token)) {
        sessionStorage.removeItem('currentUser');
      } else {
        this.currentUserSubject.next(user);
      }
    }
  }

  /** Decode JWT payload and check expiry without exposing sensitive data */
  isTokenExpired(token: string | null): boolean {
    if (!token) return true;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 < Date.now();
    } catch {
      return true;
    }
  }

  login(dto: LoginRequest): Observable<ApiResponse<AuthResponse>> {
    return this.http.post<ApiResponse<AuthResponse>>(`${this.apiUrl}/login`, dto).pipe(
      tap(res => {
        if (res.success) {
          sessionStorage.setItem('currentUser', JSON.stringify(res.data));
          this.currentUserSubject.next(res.data);
        }
      })
    );
  }

  register(dto: RegisterRequest): Observable<ApiResponse<AuthResponse>> {
    return this.http.post<ApiResponse<AuthResponse>>(`${this.apiUrl}/register`, dto).pipe(
      tap(res => {
        if (res.success) {
          sessionStorage.setItem('currentUser', JSON.stringify(res.data));
          this.currentUserSubject.next(res.data);
        }
      })
    );
  }

  logout(): void {
    sessionStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
    this.router.navigate(['/auth/login']);
  }

  getToken(): string | null {
    return this.currentUser?.token ?? null;
  }

  get currentUser(): AuthResponse | null {
    return this.currentUserSubject.value;
  }

  get isLoggedIn(): boolean {
    if (!this.currentUser) return false;
    if (this.isTokenExpired(this.currentUser.token)) {
      this.logout();
      return false;
    }
    return true;
  }

  get userRole(): string {
    return this.currentUser?.role ?? '';
  }
}
