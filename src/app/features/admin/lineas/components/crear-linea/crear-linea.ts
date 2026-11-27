import { Component, computed, effect, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { CatalogosApi } from '../../../../../core/services/catalogos';
import { LineaAmbito, LineaMatriz, LineaOperativa, LineaPotencial } from '../../../../../core/models/catalogos';
import { mensajeError } from '../../../../../core/api';

export type Nivel = 'matrices' | 'ambitos' | 'potenciales' | 'operativas';
export type RegistroLinea = LineaMatriz | LineaAmbito | LineaPotencial | LineaOperativa;

export const NIVELES: { tipo: Nivel; titulo: string; singular: string; columna: string; max: number }[] = [
  { tipo: 'matrices', titulo: 'Líneas matrices', singular: 'línea matriz', columna: 'Línea matriz', max: 150 },
  { tipo: 'ambitos', titulo: 'Ámbitos', singular: 'ámbito', columna: 'Ámbito', max: 100 },
  { tipo: 'potenciales', titulo: 'Líneas potenciales', singular: 'línea potencial', columna: 'Línea potencial', max: 255 },
  { tipo: 'operativas', titulo: 'Líneas operativas', singular: 'línea operativa', columna: 'Línea operativa', max: 255 },
];

export interface DatosCrearLinea {
  nivel: Nivel;
  registro?: RegistroLinea;
  matrices: LineaMatriz[];
  ambitos: LineaAmbito[];
  potenciales: LineaPotencial[];
}

/**
 * Crea o edita una línea de cualquier nivel. Primero se elige de qué línea matriz es,
 * luego el ámbito (si esa matriz tiene ámbitos) y la potencial, y al final se escribe el nombre
 */
@Component({
  imports: [ReactiveFormsModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule],
  selector: 'app-crear-linea',
  styleUrl: './crear-linea.scss',
  templateUrl: './crear-linea.html',
})
export class CrearLinea {
  private readonly api = inject(CatalogosApi);
  private readonly ref = inject(MatDialogRef<CrearLinea, boolean>);
  protected readonly datos = inject<DatosCrearLinea>(MAT_DIALOG_DATA);
  protected readonly info = NIVELES.find((n) => n.tipo === this.datos.nivel)!;
  protected readonly nivel = NIVELES.indexOf(this.info);

  // Al editar una operativa, matriz y ámbito salen de su potencial
  private readonly inicial = (() => {
    const r = this.datos.registro as Partial<LineaAmbito & LineaPotencial & LineaOperativa> | undefined;
    const pot = this.datos.potenciales.find((p) => p.id === r?.potencial_id);
    return { matriz_id: r?.matriz_id ?? pot?.matriz_id ?? null, ambito_id: r?.ambito_id ?? pot?.ambito_id ?? null, potencial_id: r?.potencial_id ?? null };
  })();

  protected readonly form = inject(NonNullableFormBuilder).group({
    matriz_id: [this.inicial.matriz_id as number | null, this.nivel >= 1 ? Validators.required : []],
    ambito_id: [this.inicial.ambito_id as number | null],
    potencial_id: [this.inicial.potencial_id as number | null, this.nivel >= 3 ? Validators.required : []],
    nombre: [this.datos.registro?.nombre ?? '', [Validators.required, Validators.maxLength(this.info.max)]],
  });

  private readonly matriz = toSignal(this.form.controls.matriz_id.valueChanges, { initialValue: this.inicial.matriz_id });
  private readonly ambito = toSignal(this.form.controls.ambito_id.valueChanges, { initialValue: this.inicial.ambito_id });

  protected readonly ambitos = computed(() => this.datos.ambitos.filter((a) => a.matriz_id === this.matriz()));
  /** En el documento oficial, una matriz con ámbitos los usa en todas sus potenciales; sin ámbitos va "-" */
  protected readonly usaAmbito = computed(() => this.nivel >= 2 && this.ambitos().length > 0);
  protected readonly potenciales = computed(() =>
    this.datos.potenciales.filter((p) => p.matriz_id === this.matriz() && (!this.usaAmbito() || p.ambito_id === this.ambito())),
  );

  protected readonly guardando = signal(false);
  protected readonly error = signal('');

  constructor() {
    effect(() => {
      const c = this.form.controls.ambito_id;
      c.setValidators(this.usaAmbito() ? Validators.required : []);
      c.updateValueAndValidity({ emitEvent: false });
    });
  }

  // Cambiar un nivel superior borra la elección de los de abajo
  elegirMatriz() {
    this.form.patchValue({ ambito_id: null, potencial_id: null });
  }

  elegirAmbito() {
    this.form.controls.potencial_id.setValue(null);
  }

  guardar() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    const nombre = v.nombre.trim();
    const datos = {
      matrices: { nombre },
      ambitos: { matriz_id: v.matriz_id!, nombre },
      potenciales: { matriz_id: v.matriz_id!, ambito_id: this.usaAmbito() ? v.ambito_id : null, nombre },
      operativas: { potencial_id: v.potencial_id!, nombre },
    }[this.datos.nivel];
    const id = this.datos.registro?.id;
    this.guardando.set(true);
    // El tipo de "datos" ya corresponde al nivel elegido
    const peticion = id ? this.api.editar(this.datos.nivel, id, datos as never) : this.api.crear(this.datos.nivel, datos as never);
    peticion.subscribe({
      next: () => this.ref.close(true),
      error: (e) => {
        this.error.set(mensajeError(e));
        this.guardando.set(false);
      },
    });
  }
}
