import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { catchError, switchMap, throwError } from 'rxjs';
import { Router } from '@angular/router';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const token = localStorage.getItem('accessToken');

  let authReq = req.clone({
    withCredentials: true
  });

  if (token) {
    authReq = authReq.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // Check if unauthorized (401) or forbidden (403 - for some backends)
      if ((error.status === 401) && !req.url.includes('refresh')) {
        console.warn('Access token expired or forbidden. Attempting refresh...', req.url);
        return authService.refreshToken().pipe(
          switchMap((res) => {
            const newToken = localStorage.getItem('accessToken');
            console.log('Refresh successful. Retrying original request with new token.');
            const retryReq = req.clone({
              setHeaders: {
                Authorization: `Bearer ${newToken}`
              },
              withCredentials: true
            });
            return next(retryReq);
          }),
          catchError((err) => {
            console.error('Refresh token expired or failed. Logging out.', err);
            authService.logout();
            router.navigate(['/auth']);
            return throwError(() => err);
          })
        );
      }
      return throwError(() => error);
    })
  );
};

