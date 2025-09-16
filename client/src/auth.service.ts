import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError, map, Observable, of, tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private API_URL = 'https://shorten-url-2-yomi.onrender.com';

  constructor(private http: HttpClient, private router: Router) { }

  saveTokens(accessToken: string, refreshToken: string) {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
  }

  getAccessToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  getRefreshToken(): string | null {
    return localStorage.getItem('refreshToken');
  }

  clearTokens() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }

  checkTokens(): Observable<boolean> {
    const accessToken = this.getAccessToken();
    const refreshToken = this.getRefreshToken();
    if (!accessToken || !refreshToken) {
      this.logout();
      return of(false);
    }

    return this.http.post<{ validTokens: boolean }>(`${this.API_URL}/auth/isTokensValid`, {
      accessToken: accessToken,
      refreshToken: refreshToken
    }).pipe(
      map(res => {
        if (!res.validTokens) this.logout();
        return res.validTokens;
      }),
      catchError(() => {
        this.logout();
        return of(false);
      })
    );
  }

  refreshAccessToken(refreshToken: string | null): Observable<string> {
    return this.http.post<{ accessToken: string }>(`${this.API_URL}/auth/refreshAccessToken`, { refreshToken })
      .pipe(
        tap((res) => {
          localStorage.setItem('accessToken', res.accessToken);
        }),
        map(res => res.accessToken)
      );
  }

  logout() {
    const refreshToken = this.getRefreshToken();

    if(!refreshToken) {
      this.clearTokens();
      this.router.navigate(['/login']);
    }

    else {
      this.http.post<{ msg: string }>(`${this.API_URL}/auth/logout`, { refreshToken })
        .subscribe({
          next: () => {
            this.clearTokens();
            this.router.navigate(['/login']); 
          },
          error: () => {
            // Even if backend fails, we should still clear local tokens(from local storage)
            this.clearTokens();
            this.router.navigate(['/login']);
          }
        });
    }
  }
}
