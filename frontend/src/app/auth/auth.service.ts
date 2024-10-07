import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import * as bcrypt from 'bcryptjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth/login`;
  public static TokenKey = 'auth-token';

  constructor(private http: HttpClient, private router: Router) {}

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!localStorage.getItem(AuthService.TokenKey);
  }

  // Login and hash the password before sending it to the backend
  login(username: string, password: string) {
    return this.http
    .post<{ access_token: string }>(this.apiUrl, {
      username,
      password: password,
    });
  }

  getToken(): string | null {
    return localStorage.getItem(AuthService.TokenKey);
  }

  // Logout the user
  logout(): void {
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }
}
