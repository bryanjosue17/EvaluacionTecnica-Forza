import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { tap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private base = environment.apiBase;
  constructor(private http: HttpClient) {}
  get token(): string | null { return localStorage.getItem('token'); }
  isLogged(): boolean { return !!this.token; }
  logout() { localStorage.removeItem('token'); }
  register(email: string, password: string) { return this.http.post(`${this.base}/auth/register`, { email, password }); }
  login(email: string, password: string) {
    return this.http.post<{access_token: string}>(`${this.base}/auth/login`, { email, password })
      .pipe(tap(r => localStorage.setItem('token', r.access_token)));
  }
  me() { return this.http.get<{id:number,email:string,createdAt:string}>(`${this.base}/auth/me`); }
}
