import { Component, ElementRef, signal, viewChild } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

interface TrabajoTarjeta {
  anio: number;
  siglas: 'FACES' | 'FHAE' | 'FING';
  facultad: string;
  carrera: string;
  titulo: string;
  autores: string;
  tutores: string;
  palabras: string[];
}

@Component({
  imports: [MatIconModule],
  selector: 'app-trabajos',
  styleUrl: './trabajos.scss',
  templateUrl: './trabajos.html',
})
export class Trabajos {
  private readonly ficha = viewChild.required<ElementRef<HTMLDialogElement>>('ficha');
  protected readonly seleccionado = signal<TrabajoTarjeta | null>(null);

  protected readonly facultades = ['FACES', 'FHAE', 'FING'] as const;
  protected readonly colores = { FACES: 'var(--faces)', FHAE: 'var(--fhae)', FING: 'var(--fing)' };

  // Datos de ejemplo de la maqueta hasta conectar tetBack
  protected readonly trabajos: TrabajoTarjeta[] = [
    { anio: 2024, siglas: 'FING', facultad: 'Facultad de Ingeniería', carrera: 'Ingeniería en Computación', titulo: 'Implementación de una red domótica de bajo costo para viviendas unifamiliares en Maracaibo', autores: 'María Pérez, José Rincón', tutores: 'Ing. Marcos Villalobos', palabras: ['redes', 'domótica', 'IoT'] },
    { anio: 2024, siglas: 'FACES', facultad: 'Facultad de Ciencias Económicas y Sociales', carrera: 'Licenciatura en Administración', titulo: 'Liderazgo transformacional y clima organizacional en pymes del sector comercio', autores: 'Andrea Fuenmayor', tutores: 'MSc. Aramis Dartayan', palabras: ['liderazgo', 'clima organizacional'] },
    { anio: 2023, siglas: 'FHAE', facultad: 'Facultad de Humanidades, Arte y Educación', carrera: 'Licenciatura en Educación Integral', titulo: 'Estrategias lúdicas para la comprensión lectora en educación primaria', autores: 'Paola Badell', tutores: 'Dra. Carmen Urdaneta', palabras: ['lectura', 'didáctica', 'juego'] },
    { anio: 2023, siglas: 'FING', facultad: 'Facultad de Ingeniería', carrera: 'Ingeniería en Sistemas', titulo: 'Sistema web para el control de inventario de una farmacia comunitaria', autores: 'Santiago Albanys', tutores: 'Ing. Lina González', palabras: ['sistemas web', 'inventario', 'PHP'] },
    { anio: 2023, siglas: 'FACES', facultad: 'Facultad de Ciencias Económicas y Sociales', carrera: 'Licenciatura en Contaduría Pública', titulo: 'Impacto de la inflación en los estados financieros de empresas manufactureras', autores: 'Alexandra Adarme', tutores: 'Lcda. Rosa Medina', palabras: ['inflación', 'contabilidad'] },
    { anio: 2022, siglas: 'FACES', facultad: 'Facultad de Ciencias Económicas y Sociales', carrera: 'Licenciatura en Gerencia de Recursos Humanos', titulo: 'Gestión del talento humano en instituciones educativas privadas', autores: 'Annybeth Bastardo', tutores: 'MSc. Luis Ferrer', palabras: ['talento humano', 'gestión', 'educación'] },
  ];

  abrirFicha(trabajo: TrabajoTarjeta) {
    this.seleccionado.set(trabajo);
    this.ficha().nativeElement.showModal();
  }

  cerrarFicha() {
    this.ficha().nativeElement.close();
  }
}
