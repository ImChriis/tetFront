import { inject } from '@angular/core';
import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { Auth } from '../services/auth';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(Auth);
  const router = inject(Router);
  const token = auth.getToken();
  return next(token ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Token vencido o usuario borrado: se cierra la sesión
      if (error.status === 401 && token) {
        auth.cerrarSesion();
        router.navigate(['/login']);
      }
      return throwError(() => error);
    }),
  );
};
