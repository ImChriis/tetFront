import { LineaInvestigacion } from './catalogos';

/** Autor o tutor */
export interface Persona {
  nombre: string;
  apellido: string;
  cedula: string;
}

export interface Trabajo {
  id: number;
  anio: number;
  titulo: string;
  autores: string;
  tutores: string;
  palabras_claves: string;
  carrera_id: number;
  carrera: string;
  facultad_id: number;
  siglas: string;
  facultad: string;
  tiene_resumen: boolean;
  tiene_tesis: boolean;
  lineas?: LineaInvestigacion[];
  /** Solo llega al panel, para quien puede editar el trabajo */
  autores_detalle?: Persona[];
  tutores_detalle?: Persona[];
}

export interface FiltrosTrabajos {
  q?: string;
  anio?: string;
  facultad?: string;
  facultad_id?: number;
  carrera_id?: string;
  page?: number;
  limit?: number;
}

export interface Pagina<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface Estadisticas {
  trabajos: number;
  facultades: number;
  carreras: number;
  primer_anio: number | null;
  anios: number[];
}
