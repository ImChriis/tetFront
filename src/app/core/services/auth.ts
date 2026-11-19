import { HttpClient } from '@angular/common/http';
import { Service, computed, inject, signal } from '@angular/core';
import { tap } from 'rxjs';
import { API_URL } from '../api';
import { UsuarioSesion } from '../models/usuario';

const TOKEN_KEY = 'tet_token';
const USUARIO_KEY = 'tet_usuario';

@Service()
export class Auth {
  private readonly http = inject(HttpClient);
  private readonly token = signal(localStorage.getItem(TOKEN_KEY));
  readonly usuario = signal<UsuarioSesion | null>(JSON.parse(localStorage.getItem(USUARIO_KEY) ?? 'null'));
  readonly autenticado = computed(() => this.token() !== null);

  getToken() {
    return this.token();
  }

  login(usuario: string, contrasena: string) {
    return this.http
      .post<{ token: string; usuario: UsuarioSesion }>(`${API_URL}/auth/`, { usuario, contrasena })
      .pipe(
        tap((r) => {
          localStorage.setItem(TOKEN_KEY, r.token);
          localStorage.setItem(USUARIO_KEY, JSON.stringify(r.usuario));
          this.token.set(r.token);
          this.usuario.set(r.usuario);
        }),
      );
  }

  cerrarSesion() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USUARIO_KEY);
    this.token.set(null);
    this.usuario.set(null);
  }
}
