import { Component, ElementRef, computed, inject, signal, viewChild } from '@angular/core';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { VisorPdf } from '../../../shared/components/visor-pdf/visor-pdf';
import { TrabajosApi } from '../../../core/services/trabajos';
import { CatalogosApi } from '../../../core/services/catalogos';
import { FiltrosTrabajos, Trabajo } from '../../../core/models/trabajo';

const COLORES: Record<string, string> = { FACES: 'var(--faces)', FHAE: 'var(--fhae)', FING: 'var(--fing)' };

@Component({
  imports: [MatIconModule],
  selector: 'app-trabajos',
  styleUrl: './trabajos.scss',
  templateUrl: './trabajos.html',
})
export class Trabajos {
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);
  protected readonly api = inject(TrabajosApi);
  private readonly catalogos = inject(CatalogosApi);

  private readonly ficha = viewChild.required<ElementRef<HTMLDialogElement>>('ficha');
  protected readonly seleccionado = signal<Trabajo | null>(null);

  private readonly query = toSignal(inject(ActivatedRoute).queryParamMap, { requireSync: true });

  // Los filtros viven en la URL: se pueden compartir y el botón atrás funciona
  protected readonly filtros = computed<FiltrosTrabajos>(() => {
    const p = this.query();
    return {
      q: p.get('q') ?? '',
      anio: p.get('anio') ?? '',
      facultad: p.get('facultad') ?? '',
      carrera_id: p.get('carrera_id') ?? '',
      page: Number(p.get('page')) || 1,
    };
  });

  protected readonly resultado = rxResource({ params: this.filtros, stream: ({ params }) => this.api.listar(params) });
  protected readonly estadisticas = rxResource({ stream: () => this.api.estadisticas() });
  protected readonly facultades = rxResource({ stream: () => this.catalogos.listar('facultades'), defaultValue: [] });
  private readonly carreras = rxResource({ stream: () => this.catalogos.listar('carreras'), defaultValue: [] });

  protected readonly carrerasFiltradas = computed(() => {
    const facultad = this.facultades.value().find((f) => f.siglas === this.filtros().facultad);
    return facultad ? this.carreras.value().filter((c) => c.facultad_id === facultad.id) : this.carreras.value();
  });

  protected readonly paginas = computed(() => {
    const r = this.resultado.value();
    // shortcut: muestra todos los números de página; si pasan de ~10, agregar ventana con "…"
    return r ? Array.from({ length: Math.ceil(r.total / r.limit) }, (_, i) => i + 1) : [];
  });

  // Si la portada no se puede generar se muestra el aviso en su lugar
  protected readonly portadaFallida = signal(false);

  color(siglas: string) {
    return COLORES[siglas] ?? 'var(--azul-600)';
  }

  palabras(t: Trabajo) {
    return t.palabras_claves.split(',').map((p) => p.trim()).filter(Boolean);
  }

  private espera?: ReturnType<typeof setTimeout>;

  // Filtra mientras se escribe; reemplaza la URL para no llenar el historial con cada pausa
  escribir(texto: string) {
    clearTimeout(this.espera);
    this.espera = setTimeout(() => {
      if (texto.trim() !== this.filtros().q) this.navegar({ q: texto.trim() }, true);
    }, 300);
  }

  buscar(form: HTMLFormElement) {
    clearTimeout(this.espera);
    const datos = Object.fromEntries(new FormData(form)) as Record<string, string>;
    // Si cambió la facultad, la carrera elegida puede no pertenecer a ella
    if (datos['facultad'] !== this.filtros().facultad) {
      datos['carrera_id'] = '';
    }
    this.navegar(datos);
  }

  navegar(cambios: FiltrosTrabajos, reemplazar = false) {
    const filtros = { ...this.filtros(), page: 1, ...cambios };
    const queryParams = Object.fromEntries(Object.entries(filtros).map(([k, v]) => [k, v === '' || (k === 'page' && v === 1) ? null : v]));
    this.router.navigate([], { queryParams, queryParamsHandling: 'merge', replaceUrl: reemplazar });
  }

  limpiar() {
    this.router.navigate([]);
  }

  abrirFicha(trabajo: Trabajo) {
    this.seleccionado.set(trabajo);
    this.portadaFallida.set(false);
    this.ficha().nativeElement.showModal();
  }

  verPdf(t: Trabajo, tipo: 'resumen' | 'tesis') {
    const ficha = this.ficha().nativeElement;
    const desdeFicha = ficha.open;
    // El <dialog> nativo vive en la capa superior y taparía el modal de Material: se cierra y se reabre al volver
    if (desdeFicha) ficha.close();
    VisorPdf.abrir(this.dialog, {
      url: this.api.urlArchivo(t.id, tipo),
      titulo: t.titulo,
      subtitulo: tipo === 'resumen' ? 'Resumen' : 'Trabajo completo',
    })
      .afterClosed()
      .subscribe(() => desdeFicha && ficha.showModal());
  }

  cerrarFicha() {
    this.ficha().nativeElement.close();
  }
}
