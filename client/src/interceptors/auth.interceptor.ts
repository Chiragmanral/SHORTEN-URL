import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../auth.service';
import { catchError, switchMap, throwError } from 'rxjs';

export const AuthInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const accessToken = localStorage.getItem("accessToken");

  // Attach access token if available
  const authReq = accessToken
    ? req.clone({ setHeaders: { Authorization: `Bearer ${accessToken}` } })
    : req;

  return next(authReq).pipe(
    catchError((err: HttpErrorResponse) => {
      // Retry only if 401/403 *and* request is NOT refresh/logout itself
      if ((err.status === 401 || err.status === 403) &&
          !req.url.includes('/auth/refreshAccessToken') &&
          !req.url.includes('/auth/logout')) {
        
        const refreshToken = localStorage.getItem("refreshToken");
        if (!refreshToken) {
          authService.logout();
          return throwError(() => err);
        }

        return authService.refreshAccessToken(refreshToken).pipe(
          switchMap((newAccessToken) => {
            const retryReq = req.clone({
              setHeaders: { Authorization: `Bearer ${newAccessToken}` }
            });
            return next(retryReq);
          }),
          catchError(() => {
            authService.logout();
            return throwError(() => err);
          })
        );
      }

      return throwError(() => err);
    })
  );
};
