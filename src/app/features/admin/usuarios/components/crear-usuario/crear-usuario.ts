import { Component, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { UsuariosApi } from '../../../../../core/services/usuarios';
import { CatalogosApi } from '../../../../../core/services/catalogos';
import { Usuario } from '../../../../../core/models/usuario';
import { mensajeError } from '../../../../../core/api';

/** Crea un usuario o edita el recibido; al editar la contraseña es opcional */
@Component({
  imports: [ReactiveFormsModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule, MatIconModule],
  selector: 'app-crear-usuario',
  styleUrl: './crear-usuario.scss',
  templateUrl: './crear-usuario.html',
})
export class CrearUsuario {
  private readonly api = inject(UsuariosApi);
  private readonly catalogos = inject(CatalogosApi);
  private readonly ref = inject(MatDialogRef<CrearUsuario, boolean>);
  protected readonly usuario = inject<Usuario | null>(MAT_DIALOG_DATA);

  protected readonly roles = rxResource({ stream: () => this.catalogos.listar('roles'), defaultValue: [] });
  protected readonly verClave = signal(false);
  protected readonly guardando = signal(false);
  protected readonly error = signal('');

  protected readonly form = inject(NonNullableFormBuilder).group({
    nombre: [this.usuario?.nombre ?? '', [Validators.required, Validators.maxLength(50)]],
    apellido: [this.usuario?.apellido ?? '', [Validators.required, Validators.maxLength(50)]],
    cedula: [this.usuario?.cedula ?? '', [Validators.required, Validators.maxLength(13)]],
    correo: [this.usuario?.correo ?? '', [Validators.required, Validators.email, Validators.maxLength(100)]],
    usuario: [this.usuario?.usuario ?? '', [Validators.required, Validators.maxLength(20)]],
    rol_id: [this.usuario?.rol_id ?? (null as number | null), Validators.required],
    contrasena: ['', this.usuario ? [Validators.minLength(8)] : [Validators.required, Validators.minLength(8)]],
  });

  guardar() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { contrasena, rol_id, ...resto } = this.form.getRawValue();
    const datos = { ...resto, rol_id: rol_id!, ...(contrasena ? { contrasena } : {}) };
    this.guardando.set(true);
    const peticion = this.usuario ? this.api.editar(this.usuario.id, datos) : this.api.crear(datos);
    peticion.subscribe({
      next: () => this.ref.close(true),
      error: (e) => {
        this.error.set(mensajeError(e));
        this.guardando.set(false);
      },
    });
  }
}
