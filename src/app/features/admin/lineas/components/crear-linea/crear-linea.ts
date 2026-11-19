import { Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { CatalogosApi } from '../../../../../core/services/catalogos';
import { LineaInvestigacion } from '../../../../../core/models/catalogos';
import { mensajeError } from '../../../../../core/api';

/** Crea una línea de investigación o edita la recibida */
@Component({
  imports: [ReactiveFormsModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatButtonModule],
  selector: 'app-crear-linea',
  styleUrl: './crear-linea.scss',
  templateUrl: './crear-linea.html',
})
export class CrearLinea {
  private readonly api = inject(CatalogosApi);
  private readonly ref = inject(MatDialogRef<CrearLinea, boolean>);
  protected readonly linea = inject<LineaInvestigacion | null>(MAT_DIALOG_DATA);

  protected readonly form = inject(NonNullableFormBuilder).group({
    nombre_linea: [this.linea?.nombre_linea ?? '', [Validators.required, Validators.maxLength(255)]],
    eje_tematico: [this.linea?.eje_tematico ?? '', [Validators.required, Validators.maxLength(255)]],
  });
  protected readonly guardando = signal(false);
  protected readonly error = signal('');

  guardar() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const datos = this.form.getRawValue();
    this.guardando.set(true);
    const peticion = this.linea ? this.api.editar('lineas', this.linea.id, datos) : this.api.crear('lineas', datos);
    peticion.subscribe({
      next: () => this.ref.close(true),
      error: (e) => {
        this.error.set(mensajeError(e));
        this.guardando.set(false);
      },
    });
  }
}
