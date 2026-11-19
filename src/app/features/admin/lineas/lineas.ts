import { Component, computed, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CatalogosApi } from '../../../core/services/catalogos';
import { LineaInvestigacion } from '../../../core/models/catalogos';
import { mensajeError } from '../../../core/api';
import { CrearLinea } from './components/crear-linea/crear-linea';
import { Confirmar, DatosConfirmar } from '../components/confirmar/confirmar';

@Component({
  imports: [MatTableModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, MatTooltipModule, MatProgressBarModule],
  selector: 'app-lineas',
  styleUrl: './lineas.scss',
  templateUrl: './lineas.html',
})
export class Lineas {
  private readonly api = inject(CatalogosApi);
  private readonly dialog = inject(MatDialog);
  private readonly snack = inject(MatSnackBar);

  protected readonly columnas = ['nombre_linea', 'eje_tematico', 'acciones'];
  protected readonly lineas = rxResource({ stream: () => this.api.listar('lineas'), defaultValue: [] });
  protected readonly filtro = signal('');

  // Son pocas: se filtran en el navegador
  protected readonly filtradas = computed(() => {
    const f = this.filtro().toLowerCase();
    return this.lineas.value().filter((l) => `${l.nombre_linea} ${l.eje_tematico}`.toLowerCase().includes(f));
  });

  abrir(linea?: LineaInvestigacion) {
    this.dialog
      .open(CrearLinea, { data: linea ?? null })
      .afterClosed()
      .subscribe((guardado) => {
        if (guardado) {
          this.snack.open(linea ? 'Línea actualizada' : 'Línea creada', 'OK', { duration: 3000 });
          this.lineas.reload();
        }
      });
  }

  eliminar(linea: LineaInvestigacion) {
    this.dialog
      .open<Confirmar, DatosConfirmar, boolean>(Confirmar, {
        data: { titulo: 'Eliminar línea', mensaje: `Se eliminará "${linea.nombre_linea}" y se quitará de los trabajos que la usan.`, accion: 'Eliminar' },
      })
      .afterClosed()
      .subscribe((ok) => {
        if (!ok) return;
        this.api.eliminar('lineas', linea.id).subscribe({
          next: () => {
            this.snack.open('Línea eliminada', 'OK', { duration: 3000 });
            this.lineas.reload();
          },
          error: (e) => this.snack.open(mensajeError(e), 'Cerrar', { duration: 5000 }),
        });
      });
  }
}
