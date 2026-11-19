import { Component, computed, inject } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DashboardApi } from '../../../core/services/dashboard';
import { Auth } from '../../../core/services/auth';
import { CrearTrabajo } from '../trabajos/components/crear-trabajo/crear-trabajo';

/** Tope "limpio" del eje: par para números chicos, múltiplo de potencia de 10 para grandes */
export function topeEje(max: number) {
  if (max <= 10) return Math.max(2, Math.ceil(max / 2) * 2);
  const paso = 10 ** Math.floor(Math.log10(max));
  return Math.ceil(max / paso) * paso;
}

@Component({
  imports: [DecimalPipe, RouterLink, MatButtonModule, MatIconModule, MatTooltipModule, MatProgressBarModule],
  selector: 'app-dashboard',
  styleUrl: './dashboard.scss',
  templateUrl: './dashboard.html',
})
export class Dashboard {
  private readonly api = inject(DashboardApi);
  private readonly dialog = inject(MatDialog);
  private readonly snack = inject(MatSnackBar);
  protected readonly usuario = inject(Auth).usuario;

  protected readonly datos = rxResource({ stream: () => this.api.obtener() });

  protected readonly saludo = (() => {
    const h = new Date().getHours();
    return h < 12 ? 'Buenos días' : h < 19 ? 'Buenas tardes' : 'Buenas noches';
  })();

  protected readonly completos = computed(() => {
    const t = this.datos.value()?.totales;
    return t?.trabajos ? Math.round((t.completos / t.trabajos) * 100) : 0;
  });

  // Años seguidos de principio a fin: los años sin trabajos aparecen en 0 en vez de desaparecer
  protected readonly anios = computed(() => {
    const filas = this.datos.value()?.por_anio ?? [];
    if (!filas.length) return [];
    const mapa = new Map(filas.map((f) => [f.anio, f.total]));
    const desde = filas[0].anio;
    return Array.from({ length: filas.at(-1)!.anio - desde + 1 }, (_, i) => ({ anio: desde + i, total: mapa.get(desde + i) ?? 0 }));
  });

  protected readonly topeAnios = computed(() => topeEje(Math.max(1, ...this.anios().map((a) => a.total))));
  protected readonly maxAnio = computed(() => Math.max(...this.anios().map((a) => a.total)));

  // Con muchos años solo se rotulan algunos para que no se encimen
  protected readonly cadaCuantos = computed(() => (this.anios().length > 12 ? 5 : 1));

  protected readonly maxFacultad = computed(() => Math.max(1, ...(this.datos.value()?.por_facultad ?? []).map((f) => f.total)));
  protected readonly maxCarrera = computed(() => Math.max(1, ...(this.datos.value()?.por_carrera ?? []).map((c) => c.total)));
  protected readonly maxPalabra = computed(() => Math.max(1, ...(this.datos.value()?.palabras ?? []).map((p) => p.total)));

  rotular(i: number, total: number) {
    const ultimo = this.anios().length - 1;
    return i === 0 || i === ultimo || (i % this.cadaCuantos() === 0 && ultimo - i >= this.cadaCuantos() / 2) || total === this.maxAnio();
  }

  abrirTrabajo(id?: number) {
    this.dialog
      .open(CrearTrabajo, { data: { id }, width: '760px', maxWidth: '95vw' })
      .afterClosed()
      .subscribe((guardado) => {
        if (guardado) {
          this.snack.open(id ? 'Trabajo actualizado' : 'Trabajo creado', 'OK', { duration: 3000 });
          this.datos.reload();
        }
      });
  }
}
