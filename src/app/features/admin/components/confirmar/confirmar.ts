import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

export interface DatosConfirmar {
  titulo: string;
  mensaje: string;
  accion: string;
  /** false para acciones que no destruyen nada: el botón sale azul en vez de rojo */
  peligro?: boolean;
}

/** Diálogo de confirmación; cierra con true si se confirma */
@Component({
  imports: [MatDialogModule, MatButtonModule],
  selector: 'app-confirmar',
  template: `
    <h2 mat-dialog-title>{{ datos.titulo }}</h2>
    <mat-dialog-content>{{ datos.mensaje }}</mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancelar</button>
      <button mat-flat-button [class.peligro]="datos.peligro !== false" [mat-dialog-close]="true">{{ datos.accion }}</button>
    </mat-dialog-actions>
  `,
  styles: `.peligro { --mat-button-filled-container-color: #b42318; }`,
})
export class Confirmar {
  protected readonly datos = inject<DatosConfirmar>(MAT_DIALOG_DATA);
}
