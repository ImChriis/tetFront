import { Component, inject } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { API_URL } from '../../../core/api';

export interface DatosVisorPdf {
  url: string;
  titulo: string;
  subtitulo?: string;
}

/** Modal para leer un PDF de tetBack sin salir de la página */
@Component({
  imports: [MatDialogModule, MatButtonModule, MatIconModule, MatTooltipModule],
  selector: 'app-visor-pdf',
  styleUrl: './visor-pdf.scss',
  templateUrl: './visor-pdf.html',
})
export class VisorPdf {
  protected readonly datos = inject<DatosVisorPdf>(MAT_DIALOG_DATA);

  // Solo se confía en PDFs servidos por nuestra propia API
  protected readonly url = this.datos.url.startsWith(API_URL)
    ? inject(DomSanitizer).bypassSecurityTrustResourceUrl(this.datos.url)
    : null;

  static abrir(dialog: MatDialog, datos: DatosVisorPdf) {
    return dialog.open(VisorPdf, {
      data: datos,
      width: '1100px',
      maxWidth: '95vw',
      height: '92vh',
      panelClass: 'visor-pdf-panel',
      autoFocus: 'dialog',
    });
  }
}
