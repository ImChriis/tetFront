import { Component, computed, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorIntl, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TrabajosApi } from '../../../core/services/trabajos';
import { CatalogosApi } from '../../../core/services/catalogos';
import { Auth } from '../../../core/services/auth';
import { mensajeError } from '../../../core/api';
import { Trabajo } from '../../../core/models/trabajo';
import { PaginadorEs } from '../../../core/paginador-es';
import { CrearTrabajo } from './components/crear-trabajo/crear-trabajo';
import { Confirmar, DatosConfirmar } from '../components/confirmar/confirmar';
import { VisorPdf } from '../../../shared/components/visor-pdf/visor-pdf';

@Component({
  imports: [MatTableModule, MatPaginatorModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule, MatIconModule, MatTooltipModule, MatProgressBarModule],
  providers: [{ provide: MatPaginatorIntl, useClass: PaginadorEs }],
  selector: 'app-trabajos-admin',
  styleUrl: './trabajos.scss',
  templateUrl: './trabajos.html',
})
export class TrabajosAdmin {
  protected readonly api = inject(TrabajosApi);
  private readonly dialog = inject(MatDialog);
  private readonly snack = inject(MatSnackBar);
  protected readonly usuario = inject(Auth).usuario;

  protected readonly columnas = ['anio', 'titulo', 'carrera', 'archivos', 'acciones'];
  protected readonly q = signal('');
  protected readonly facultadId = signal<number | undefined>(this.usuario()?.facultad_id ?? undefined);
  protected readonly pagina = signal({ page: 1, limit: 10 });

  private readonly catalogos = inject(CatalogosApi);
  protected readonly facultades = rxResource({ stream: () => this.catalogos.listar('facultades'), defaultValue: [] });

  // Un decano siempre ve solo su facultad (el backend igual valida los permisos)
  protected readonly resultado = rxResource({
    params: () => ({ q: this.q(), facultad_id: this.facultadId(), ...this.pagina() }),
    stream: ({ params }) => this.api.listar(params),
  });

  protected readonly trabajos = computed(() => this.resultado.value()?.data ?? []);

  private espera?: ReturnType<typeof setTimeout>;

  // Filtra mientras se escribe, esperando una pausa para no pedir en cada tecla
  escribir(texto: string) {
    clearTimeout(this.espera);
    this.espera = setTimeout(() => this.buscar(texto), 300);
  }

  buscar(texto: string) {
    clearTimeout(this.espera);
    if (texto.trim() === this.q()) return;
    this.q.set(texto.trim());
    this.pagina.update((p) => ({ ...p, page: 1 }));
  }

  filtrarFacultad(id: number | undefined) {
    this.facultadId.set(id);
    this.pagina.update((p) => ({ ...p, page: 1 }));
  }

  paginar(e: PageEvent) {
    this.pagina.set({ page: e.pageIndex + 1, limit: e.pageSize });
  }

  abrir(trabajo?: Trabajo) {
    this.dialog
      .open(CrearTrabajo, { data: { id: trabajo?.id }, width: '760px', maxWidth: '95vw', autoFocus: 'first-tabbable' })
      .afterClosed()
      .subscribe((guardado) => {
        if (guardado) {
          this.snack.open(trabajo ? 'Trabajo actualizado' : 'Trabajo creado', 'OK', { duration: 3000 });
          this.resultado.reload();
        }
      });
  }

  verPdf(t: Trabajo, tipo: 'resumen' | 'tesis') {
    VisorPdf.abrir(this.dialog, { url: this.api.urlArchivo(t.id, tipo), titulo: t.titulo, subtitulo: tipo === 'resumen' ? 'Resumen' : 'Trabajo completo' });
  }

  eliminar(trabajo: Trabajo) {
    this.dialog
      .open<Confirmar, DatosConfirmar, boolean>(Confirmar, {
        data: { titulo: 'Eliminar trabajo', mensaje: `Se eliminará "${trabajo.titulo}" y sus PDF. No se puede deshacer.`, accion: 'Eliminar' },
      })
      .afterClosed()
      .subscribe((ok) => {
        if (!ok) return;
        this.api.eliminar(trabajo.id).subscribe({
          next: () => {
            this.snack.open('Trabajo eliminado', 'OK', { duration: 3000 });
            this.resultado.reload();
          },
          error: (e) => this.snack.open(mensajeError(e), 'Cerrar', { duration: 5000 }),
        });
      });
  }
}
