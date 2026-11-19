import { Component, computed, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Auth } from '../../core/services/auth';

const ENLACES = [
  { ruta: '/admin', icono: 'space_dashboard', texto: 'Panel', exacto: true, soloAdmin: false },
  { ruta: '/admin/trabajos', icono: 'menu_book', texto: 'Trabajos', exacto: false, soloAdmin: false },
  { ruta: '/admin/lineas', icono: 'hub', texto: 'Líneas', exacto: false, soloAdmin: true },
  { ruta: '/admin/usuarios', icono: 'group', texto: 'Usuarios', exacto: false, soloAdmin: true },
];

@Component({
  imports: [RouterOutlet, RouterLink, RouterLinkActive, MatSidenavModule, MatToolbarModule, MatListModule, MatIconModule, MatButtonModule],
  selector: 'app-admin-layout',
  styleUrl: './admin-layout.scss',
  templateUrl: './admin-layout.html',
})
export class AdminLayout {
  private readonly auth = inject(Auth);
  private readonly router = inject(Router);
  protected readonly usuario = this.auth.usuario;
  protected readonly enlaces = computed(() => ENLACES.filter((e) => !e.soloAdmin || this.usuario()?.es_admin));

  salir() {
    this.auth.cerrarSesion();
    this.router.navigate(['/login']);
  }
}
