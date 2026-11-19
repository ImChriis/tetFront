import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', title: 'Inicio · TEG UJGH', loadComponent: () => import('./features/publico/portada/portada').then(m => m.Portada) },
  {
    path: '',
    loadComponent: () => import('./layouts/public-layout/public-layout').then(m => m.PublicLayout),
    children: [
      { path: 'trabajos', title: 'Trabajos · TEG UJGH', loadComponent: () => import('./features/publico/trabajos/trabajos').then(m => m.Trabajos) },
      { path: 'trabajos/:id', title: 'Trabajo · TEG UJGH', loadComponent: () => import('./features/publico/trabajo-detalle/trabajo-detalle').then(m => m.TrabajoDetalle) },
      { path: 'contacto', title: 'Contacto · TEG UJGH', loadComponent: () => import('./features/publico/contacto/contacto').then(m => m.Contacto) },
    ],
  },
  { path: 'login', title: 'Acceso · TEG UJGH', loadComponent: () => import('./features/auth/login/login').then(m => m.Login) },
  { path: 'recuperar', title: 'Recuperar contraseña · TEG UJGH', loadComponent: () => import('./features/auth/recuperar/recuperar').then(m => m.Recuperar) },
  {
    path: 'admin',
    loadComponent: () => import('./layouts/admin-layout/admin-layout').then(m => m.AdminLayout),
    canActivate: [authGuard],
    loadChildren: () => import('./features/admin/admin.routes'),
  },
  { path: '**', redirectTo: '' },
];
