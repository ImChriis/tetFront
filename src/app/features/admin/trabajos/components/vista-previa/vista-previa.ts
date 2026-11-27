import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Observable, filter, of } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TrabajosApi } from '../../../../../core/services/trabajos';
import { Trabajo } from '../../../../../core/models/trabajo';
import { mensajeError } from '../../../../../core/api';
import { VisorPdf } from '../../../../../shared/components/visor-pdf/visor-pdf';
import { Confirmar, DatosConfirmar } from '../../../components/confirmar/confirmar';

/** Pide confirmación antes de publicar; retirarlo del sitio no la necesita. Emite solo si se confirma */
export function confirmarPublicacion(dialog: MatDialog, t: Trabajo, publicado: boolean): Observable<unknown> {
  if (!publicado) return of(true);
  return dialog
    .open<Confirmar, DatosConfirmar, boolean>(Confirmar, {
      data: {
        titulo: 'Publicar trabajo',
        mensaje: `"${t.titulo}" quedará visible para alumnos y visitantes en el repositorio, con su resumen y su trabajo completo.`,
        accion: 'Publicar',
        peligro: false,
      },
    })
    .afterClosed()
    .pipe(filter(Boolean));
}

/**
 * Muestra el trabajo como lo verán los visitantes, con lo que le falta para publicarse,
 * y permite publicarlo o retirarlo desde ahí
 */
@Component({
  imports: [MatDialogModule, MatButtonModule, MatIconModule, MatProgressBarModule],
  selector: 'app-vista-previa',
  styleUrl: './vista-previa.scss',
  templateUrl: './vista-previa.html',
})
export class VistaPrevia {
  private readonly api = inject(TrabajosApi);
  private readonly dialog = inject(MatDialog);
  private readonly snack = inject(MatSnackBar);
  private readonly id = inject<{ id: number }>(MAT_DIALOG_DATA).id;

  protected readonly trabajo = rxResource({ params: () => this.id, stream: ({ params: id }) => this.api.obtener(id) });
  protected readonly palabras = computed(() => (this.trabajo.value()?.palabras_claves ?? '').split(',').map((p) => p.trim()).filter(Boolean));
  protected readonly guardando = signal(false);

  // La portada de un trabajo no publicado necesita el token: se descarga y se muestra como blob
  protected readonly portada = signal('');
  protected readonly portadaFallida = signal(false);

  constructor() {
    const sub = this.api.blob(this.api.urlPortada(this.id)).subscribe({
      next: (b) => this.portada.set(URL.createObjectURL(b)),
      error: () => this.portadaFallida.set(true),
    });
    inject(DestroyRef).onDestroy(() => {
      sub.unsubscribe();
      if (this.portada()) URL.revokeObjectURL(this.portada());
    });
  }

  color(siglas: string) {
    return `var(--${siglas.toLowerCase()}, var(--azul-600))`;
  }

  verPdf(t: Trabajo, tipo: 'resumen' | 'tesis') {
    VisorPdf.abrir(this.dialog, { url: this.api.urlArchivo(t.id, tipo), titulo: t.titulo, subtitulo: tipo === 'resumen' ? 'Resumen' : 'Trabajo completo' });
  }

  publicar(t: Trabajo, publicado: boolean) {
    confirmarPublicacion(this.dialog, t, publicado).subscribe(() => this.cambiarPublicado(t, publicado));
  }

  private cambiarPublicado(t: Trabajo, publicado: boolean) {
    this.guardando.set(true);
    this.api.publicar(t.id, publicado).subscribe({
      next: () => {
        this.guardando.set(false);
        this.trabajo.update((v) => v && { ...v, publicado });
        this.snack.open(publicado ? 'Trabajo publicado' : 'Trabajo retirado del sitio público', 'OK', { duration: 3000 });
      },
      error: (e) => {
        this.guardando.set(false);
        this.snack.open(mensajeError(e), 'Cerrar', { duration: 5000 });
      },
    });
  }
}
