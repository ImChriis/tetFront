import { Routes } from '@angular/router';

export default [
  { path: '', title: 'Panel · TEG UJGH', loadComponent: () => import('./dashboard/dashboard').then(m => m.Dashboard) },
  { path: 'trabajos', title: 'Trabajos · Panel', loadComponent: () => import('./trabajos/trabajos-lista/trabajos-lista').then(m => m.TrabajosLista) },
  { path: 'trabajos/nuevo', title: 'Nuevo trabajo · Panel', loadComponent: () => import('./trabajos/trabajo-form/trabajo-form').then(m => m.TrabajoForm) },
  { path: 'trabajos/:id/editar', title: 'Editar trabajo · Panel', loadComponent: () => import('./trabajos/trabajo-form/trabajo-form').then(m => m.TrabajoForm) },
  { path: 'catalogos', title: 'Catálogos · Panel', loadComponent: () => import('./catalogos/catalogos').then(m => m.Catalogos) },
  { path: 'usuarios', title: 'Usuarios · Panel', loadComponent: () => import('./usuarios/usuarios').then(m => m.Usuarios) },
] satisfies Routes;
