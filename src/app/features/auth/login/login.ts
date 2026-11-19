import { Component, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { Auth } from '../../../core/services/auth';

@Component({
  imports: [RouterLink, MatIconModule],
  selector: 'app-login',
  styleUrl: './login.scss',
  templateUrl: './login.html',
})
export class Login {
  private readonly auth = inject(Auth);
  private readonly router = inject(Router);
  protected readonly enviando = signal(false);
  protected readonly error = signal('');

  ingresar(form: HTMLFormElement) {
    const datos = new FormData(form);
    this.enviando.set(true);
    this.error.set('');
    this.auth.login(String(datos.get('usuario')), String(datos.get('contrasena'))).subscribe({
      next: () => this.router.navigate(['/admin']),
      error: (e: HttpErrorResponse) => {
        this.error.set(e.status === 401 ? 'Usuario o contraseña incorrectos.' : 'No se pudo conectar. Intenta de nuevo.');
        this.enviando.set(false);
      },
    });
  }
}
