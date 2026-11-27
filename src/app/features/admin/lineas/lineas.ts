import { Component, computed, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorIntl, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CatalogosApi } from '../../../core/services/catalogos';
import { mensajeError } from '../../../core/api';
import { PaginadorEs } from '../../../core/paginador-es';
import { CrearLinea, DatosCrearLinea, NIVELES, Nivel, RegistroLinea } from './components/crear-linea/crear-linea';
import { Confirmar, DatosConfirmar } from '../components/confirmar/confirmar';

interface Fila {
  registro: RegistroLinea;
  nombre: string;
  matriz: string;
  ambito: string;
  potencial: string;
}

const COLUMNAS: Record<Nivel, string[]> = {
  matrices: ['nombre', 'acciones'],
  ambitos: ['matriz', 'nombre', 'acciones'],
  potenciales: ['matriz', 'ambito', 'nombre', 'acciones'],
  operativas: ['matriz', 'ambito', 'potencial', 'nombre', 'acciones'],
};

@Component({
  imports: [MatTableModule, MatPaginatorModule, MatButtonToggleModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, MatTooltipModule, MatProgressBarModule],
  providers: [{ provide: MatPaginatorIntl, useClass: PaginadorEs }],
  selector: 'app-lineas',
  styleUrl: './lineas.scss',
  templateUrl: './lineas.html',
})
export class Lineas {
  private readonly api = inject(CatalogosApi);
  private readonly dialog = inject(MatDialog);
  private readonly snack = inject(MatSnackBar);

  protected readonly niveles = NIVELES;
  protected readonly nivel = signal<Nivel>('matrices');
  protected readonly info = computed(() => NIVELES.find((n) => n.tipo === this.nivel())!);
  protected readonly columnas = computed(() => COLUMNAS[this.nivel()]);
  protected readonly filtro = signal('');
  protected readonly pagina = signal({ index: 0, size: 25 });

  private readonly matrices = rxResource({ stream: () => this.api.listar('matrices'), defaultValue: [] });
  private readonly ambitos = rxResource({ stream: () => this.api.listar('ambitos'), defaultValue: [] });
  private readonly potenciales = rxResource({ stream: () => this.api.listar('potenciales'), defaultValue: [] });
  private readonly operativas = rxResource({ stream: () => this.api.listar('operativas'), defaultValue: [] });
  private readonly recursos = { matrices: this.matrices, ambitos: this.ambitos, potenciales: this.potenciales, operativas: this.operativas };

  protected readonly cargando = computed(() => Object.values(this.recursos).some((r) => r.isLoading()));
  protected readonly error = computed(() => Object.values(this.recursos).some((r) => r.error()));
  protected readonly totales = computed(() => ({
    matrices: this.matrices.value().length,
    ambitos: this.ambitos.value().length,
    potenciales: this.potenciales.value().length,
    operativas: this.operativas.value().length,
  }));

  // Son pocas centenas: se arman y filtran en el navegador
  protected readonly filas = computed<Fila[]>(() => {
    const nombre = (lista: { id: number; nombre: string }[]) => new Map(lista.map((x) => [x.id, x.nombre]));
    const m = nombre(this.matrices.value());
    const a = nombre(this.ambitos.value());
    const p = new Map(this.potenciales.value().map((x) => [x.id, x]));
    const ambito = (id: number | null) => (id ? (a.get(id) ?? '') : '—');
    switch (this.nivel()) {
      case 'matrices':
        return this.matrices.value().map((r) => ({ registro: r, nombre: r.nombre, matriz: '', ambito: '', potencial: '' }));
      case 'ambitos':
        return this.ambitos.value().map((r) => ({ registro: r, nombre: r.nombre, matriz: m.get(r.matriz_id) ?? '', ambito: '', potencial: '' }));
      case 'potenciales':
        return this.potenciales.value().map((r) => ({ registro: r, nombre: r.nombre, matriz: m.get(r.matriz_id) ?? '', ambito: ambito(r.ambito_id), potencial: '' }));
      case 'operativas':
        return this.operativas.value().map((r) => {
          const pot = p.get(r.potencial_id);
          return { registro: r, nombre: r.nombre, matriz: m.get(pot?.matriz_id ?? 0) ?? '', ambito: ambito(pot?.ambito_id ?? null), potencial: pot?.nombre ?? '' };
        });
    }
  });

  protected readonly filtradas = computed(() => {
    const f = this.filtro().toLowerCase();
    return this.filas().filter((x) => `${x.nombre} ${x.matriz} ${x.ambito} ${x.potencial}`.toLowerCase().includes(f));
  });

  protected readonly visibles = computed(() => {
    const { index, size } = this.pagina();
    return this.filtradas().slice(index * size, (index + 1) * size);
  });

  cambiarNivel(nivel: Nivel) {
    this.nivel.set(nivel);
    this.filtrar('');
  }

  filtrar(texto: string) {
    this.filtro.set(texto);
    this.pagina.update((p) => ({ ...p, index: 0 }));
  }

  paginar(e: PageEvent) {
    this.pagina.set({ index: e.pageIndex, size: e.pageSize });
  }

  abrir(registro?: RegistroLinea) {
    const nivel = this.nivel();
    this.dialog
      .open<CrearLinea, DatosCrearLinea, boolean>(CrearLinea, {
        data: { nivel, registro, matrices: this.matrices.value(), ambitos: this.ambitos.value(), potenciales: this.potenciales.value() },
        width: '560px',
        maxWidth: '95vw',
      })
      .afterClosed()
      .subscribe((guardado) => {
        if (guardado) {
          this.snack.open(registro ? 'Línea actualizada' : 'Línea creada', 'OK', { duration: 3000 });
          this.recursos[nivel].reload();
        }
      });
  }

  eliminar(fila: Fila) {
    const nivel = this.nivel();
    this.dialog
      .open<Confirmar, DatosConfirmar, boolean>(Confirmar, {
        data: { titulo: `Eliminar ${this.info().singular}`, mensaje: `Se eliminará "${fila.nombre}". Si tiene líneas dentro o trabajos asignados, no se podrá eliminar.`, accion: 'Eliminar' },
      })
      .afterClosed()
      .subscribe((ok) => {
        if (!ok) return;
        this.api.eliminar(nivel, fila.registro.id).subscribe({
          next: () => {
            this.snack.open('Línea eliminada', 'OK', { duration: 3000 });
            this.recursos[nivel].reload();
          },
          error: (e) => this.snack.open(mensajeError(e), 'Cerrar', { duration: 5000 }),
        });
      });
  }
}
