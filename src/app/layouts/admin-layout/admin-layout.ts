import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Auth } from '../../core/services/auth';

@Component({
  imports: [RouterOutlet, RouterLink, RouterLinkActive, MatSidenavModule, MatToolbarModule, MatListModule, MatIconModule, MatButtonModule],
  selector: 'app-admin-layout',
  styleUrl: './admin-layout.scss',
  templateUrl: './admin-layout.html',
})
export class AdminLayout {
  private readonly auth = inject(Auth);
  private readonly router = inject(Router);

  protected readonly enlaces = [
    { ruta: '/admin', icono: 'dashboard', texto: 'Panel', exacto: true },
    { ruta: '/admin/trabajos', icono: 'menu_book', texto: 'Trabajos', exacto: false },
    { ruta: '/admin/catalogos', icono: 'category', texto: 'Catálogos', exacto: false },
    { ruta: '/admin/usuarios', icono: 'group', texto: 'Usuarios', exacto: false },
  ];

  salir() {
    this.auth.cerrarSesion();
    this.router.navigate(['/login']);
  }
}
