export interface Facultad {
  id: number;
  facultad: string;
  siglas: string;
}

export interface Carrera {
  id: number;
  carrera: string;
  facultad_id: number;
}

export interface LineaInvestigacion {
  id: number;
  nombre_linea: string;
  eje_tematico: string;
}
