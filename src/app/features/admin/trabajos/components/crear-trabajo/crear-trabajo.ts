import { Component, computed, effect, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { TrabajosApi } from '../../../../../core/services/trabajos';
import { Persona } from '../../../../../core/models/trabajo';
import { CatalogosApi } from '../../../../../core/services/catalogos';
import { Auth } from '../../../../../core/services/auth';
import { mensajeError } from '../../../../../core/api';

const MAX_PDF = 20 * 1024 * 1024;
// 12345678, 12.345.678 o V-12345678 (el backend normaliza puntos y espacios)
const CEDULA = /^([VvEe]-?)?(\d[.\s]?){5,9}\d$/;
type TipoPdf = 'resumen' | 'tesis';
type Campo = 'autores' | 'tutores';

/** Crea un trabajo (sin id) o edita uno existente (con id) */
@Component({
  imports: [ReactiveFormsModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule, MatIconModule, MatProgressBarModule],
  selector: 'app-crear-trabajo',
  styleUrl: './crear-trabajo.scss',
  templateUrl: './crear-trabajo.html',
})
export class CrearTrabajo {
  private readonly api = inject(TrabajosApi);
  private readonly catalogos = inject(CatalogosApi);
  private readonly usuario = inject(Auth).usuario;
  private readonly ref = inject(MatDialogRef<CrearTrabajo, boolean>);
  protected readonly id = inject<{ id?: number } | null>(MAT_DIALOG_DATA)?.id;

  protected readonly tipos = ['resumen', 'tesis'] as const;
  protected readonly anioMax = new Date().getFullYear() + 1;
  private readonly fb = inject(NonNullableFormBuilder);
  // Mismos límites que MAX_PERSONAS del backend
  protected readonly personas = [
    { campo: 'autores', singular: 'autor', titulo: 'Autores', max: 10 },
    { campo: 'tutores', singular: 'tutor', titulo: 'Tutores', max: 5 },
  ] as const;
  protected readonly form = this.fb.group({
    titulo: ['', [Validators.required, Validators.maxLength(255)]],
    autores: this.fb.array([this.nuevaPersona()], Validators.minLength(1)),
    tutores: this.fb.array([this.nuevaPersona()], Validators.minLength(1)),
    palabras_claves: ['', [Validators.required, Validators.maxLength(140)]],
    anio: [new Date().getFullYear(), [Validators.required, Validators.min(1901), Validators.max(this.anioMax)]],
    carrera_id: [null as number | null, Validators.required],
    lineas: [[] as number[]],
  });

  protected readonly archivos = signal<Record<TipoPdf, File | null>>({ resumen: null, tesis: null });
  protected readonly actuales = signal<Record<TipoPdf, boolean>>({ resumen: false, tesis: false });
  protected readonly guardando = signal(false);
  protected readonly error = signal('');

  private readonly facultades = rxResource({ stream: () => this.catalogos.listar('facultades'), defaultValue: [] });
  private readonly carreras = rxResource({ stream: () => this.catalogos.listar('carreras'), defaultValue: [] });
  protected readonly lineas = rxResource({ stream: () => this.catalogos.listar('lineas'), defaultValue: [] });

  // Un decano solo puede elegir carreras de su facultad
  protected readonly grupos = computed(() => {
    const u = this.usuario();
    return this.facultades
      .value()
      .filter((f) => u?.es_admin || f.id === u?.facultad_id)
      .map((f) => ({ facultad: f, carreras: this.carreras.value().filter((c) => c.facultad_id === f.id) }));
  });

  protected readonly cargando = rxResource({
    params: () => this.id,
    stream: ({ params: id }) => this.api.obtener(id),
  });

  constructor() {
    if (this.id) {
      this.form.disable();
    }
    // Al llegar el trabajo a editar, se copia al formulario
    effect(() => {
      const t = this.cargando.value();
      if (!t) return;
      const { autores, tutores, ...resto } = t;
      this.form.patchValue({ ...resto, lineas: t.lineas?.map((l) => l.id) ?? [] });
      // Los trabajos viejos solo tienen el texto de autores y tutores: se pone como nombre para completarlo
      this.llenar('autores', t.autores_detalle, autores);
      this.llenar('tutores', t.tutores_detalle, tutores);
      this.form.markAllAsTouched();
      this.actuales.set({ resumen: t.tiene_resumen, tesis: t.tiene_tesis });
      this.form.enable();
    });
  }

  private nuevaPersona(a?: Persona) {
    return this.fb.group({
      nombre: [a?.nombre ?? '', [Validators.required, Validators.maxLength(50)]],
      apellido: [a?.apellido ?? '', [Validators.required, Validators.maxLength(50)]],
      cedula: [a?.cedula ?? '', [Validators.required, Validators.pattern(CEDULA)]],
    });
  }

  private llenar(campo: Campo, detalle: Persona[] | undefined, texto: string) {
    const lista = detalle?.length ? detalle : [{ nombre: texto, apellido: '', cedula: '' }];
    this.form.controls[campo].clear();
    lista.forEach((p) => this.form.controls[campo].push(this.nuevaPersona(p)));
  }

  agregar(campo: Campo) {
    this.form.controls[campo].push(this.nuevaPersona());
  }

  quitar(campo: Campo, i: number) {
    this.form.controls[campo].removeAt(i);
  }

  elegirArchivo(tipo: TipoPdf, input: HTMLInputElement) {
    const archivo = input.files?.[0] ?? null;
    input.value = '';
    if (archivo && (archivo.type !== 'application/pdf' || archivo.size > MAX_PDF)) {
      this.error.set(`El ${tipo} debe ser un PDF de máximo 20 MB.`);
      return;
    }
    this.error.set('');
    this.archivos.update((a) => ({ ...a, [tipo]: archivo }));
  }

  guardar() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { lineas, autores, tutores, ...campos } = this.form.getRawValue();
    const datos = new FormData();
    Object.entries(campos).forEach(([k, v]) => datos.append(k, String(v)));
    datos.append('autores', JSON.stringify(autores));
    datos.append('tutores', JSON.stringify(tutores));
    lineas.forEach((l) => datos.append('lineas[]', String(l)));
    (['resumen', 'tesis'] as const).forEach((tipo) => {
      const archivo = this.archivos()[tipo];
      if (archivo) datos.append(tipo, archivo);
    });

    this.guardando.set(true);
    this.error.set('');
    this.api.guardar(datos, this.id).subscribe({
      next: () => this.ref.close(true),
      error: (e) => {
        this.error.set(mensajeError(e));
        this.guardando.set(false);
      },
    });
  }
}
