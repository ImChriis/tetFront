import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth } from '../services/auth';

export const authGuard: CanActivateFn = () =>
  inject(Auth).autenticado() || inject(Router).createUrlTree(['/login']);
