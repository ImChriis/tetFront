/** Línea operativa de un trabajo, con los nombres de sus niveles superiores */
export interface LineaTrabajo {
  id: number;
  nombre: string;
  potencial: string;
  ambito: string | null;
  matriz: string;
}

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
  tiene_autores: boolean;
  tiene_tutores: boolean;
  publicado: boolean;
  /** Lo que falta para poder publicarlo; vacío si está completo */
  faltantes: string[];
  lineas?: LineaTrabajo[];
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
  /** 1 = incluir no publicados (solo panel) */
  panel?: number;
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
