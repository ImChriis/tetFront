import { Routes } from '@angular/router';
import { adminGuard } from '../../core/guards/admin-guard';

export default [
  { path: '', title: 'Panel · TEG UJGH', loadComponent: () => import('./dashboard/dashboard').then(m => m.Dashboard) },
  { path: 'trabajos', title: 'Trabajos · Panel', loadComponent: () => import('./trabajos/trabajos').then(m => m.TrabajosAdmin) },
  { path: 'lineas', title: 'Líneas de investigación · Panel', canActivate: [adminGuard], loadComponent: () => import('./lineas/lineas').then(m => m.Lineas) },
  { path: 'usuarios', title: 'Usuarios · Panel', canActivate: [adminGuard], loadComponent: () => import('./usuarios/usuarios').then(m => m.Usuarios) },
] satisfies Routes;
