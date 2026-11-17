import { Service, computed, signal } from '@angular/core';

const TOKEN_KEY = 'tet_token';

@Service()
export class Auth {
  private readonly token = signal(localStorage.getItem(TOKEN_KEY));
  readonly autenticado = computed(() => this.token() !== null);

  getToken() {
    return this.token();
  }

  guardarToken(token: string) {
    localStorage.setItem(TOKEN_KEY, token);
    this.token.set(token);
  }

  cerrarSesion() {
    localStorage.removeItem(TOKEN_KEY);
    this.token.set(null);
  }
}
