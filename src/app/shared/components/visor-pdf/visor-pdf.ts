import { Component, DestroyRef, inject, signal } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { API_URL } from '../../../core/api';
import { TrabajosApi } from '../../../core/services/trabajos';

export interface DatosVisorPdf {
  url: string;
  titulo: string;
  subtitulo?: string;
}

/** Modal para leer un PDF de tetBack sin salir de la página */
@Component({
  imports: [MatDialogModule, MatButtonModule, MatIconModule, MatTooltipModule, MatProgressBarModule],
  selector: 'app-visor-pdf',
  styleUrl: './visor-pdf.scss',
  templateUrl: './visor-pdf.html',
})
export class VisorPdf {
  protected readonly datos = inject<DatosVisorPdf>(MAT_DIALOG_DATA);
  protected readonly estado = signal<'cargando' | 'listo' | 'error'>('cargando');
  /** URL local (blob:) del PDF descargado */
  protected readonly enlace = signal('');
  protected readonly url = signal<SafeResourceUrl | null>(null);

  constructor() {
    // Solo se confía en PDFs de nuestra propia API. Se descargan con el token de sesión
    // para que el panel pueda ver los de trabajos aún no publicados
    if (!this.datos.url.startsWith(API_URL)) {
      this.estado.set('error');
      return;
    }
    const sanitizer = inject(DomSanitizer);
    const sub = inject(TrabajosApi)
      .blob(this.datos.url)
      .subscribe({
        next: (b) => {
          this.enlace.set(URL.createObjectURL(new Blob([b], { type: 'application/pdf' })));
          this.url.set(sanitizer.bypassSecurityTrustResourceUrl(this.enlace()));
          this.estado.set('listo');
        },
        error: () => this.estado.set('error'),
      });
    inject(DestroyRef).onDestroy(() => {
      sub.unsubscribe();
      if (this.enlace()) URL.revokeObjectURL(this.enlace());
    });
  }

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
