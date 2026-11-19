import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth } from '../services/auth';

/** Solo el rol Administrador; los decanos vuelven al panel */
export const adminGuard: CanActivateFn = () =>
  inject(Auth).usuario()?.es_admin === true || inject(Router).createUrlTree(['/admin']);
