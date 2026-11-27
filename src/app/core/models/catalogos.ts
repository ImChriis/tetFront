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

// Líneas de investigación en cuatro niveles: matriz → ámbito → potencial → operativa
export interface LineaMatriz {
  id: number;
  nombre: string;
}

export interface LineaAmbito {
  id: number;
  matriz_id: number;
  nombre: string;
}

export interface LineaPotencial {
  id: number;
  matriz_id: number;
  /** null cuando la matriz no tiene ámbito */
  ambito_id: number | null;
  nombre: string;
}

/** La que se asigna a los trabajos */
export interface LineaOperativa {
  id: number;
  potencial_id: number;
  nombre: string;
}
