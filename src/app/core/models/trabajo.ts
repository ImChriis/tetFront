export interface Trabajo {
  id: number;
  annio: number;
  titulo: string;
  autores: string;
  tutores: string;
  palabras_claves: string;
  resumen: string | null;
  tesis: string | null;
  id_carrera: number;
}
