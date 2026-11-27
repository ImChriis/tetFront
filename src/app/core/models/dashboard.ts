export interface Dashboard {
  totales: { trabajos: number; con_resumen: number; con_tesis: number; completos: number; publicados: number; carreras: number; lineas: number };
  por_anio: { anio: number; total: number }[];
  por_facultad: { siglas: string; facultad: string; total: number }[];
  por_carrera: { carrera: string; siglas: string; total: number }[];
  palabras: { palabra: string; total: number }[];
  pendientes: { id: number; titulo: string; anio: number; siglas: string; falta_resumen: boolean; falta_tesis: boolean }[];
  recientes: { id: number; titulo: string; anio: number; carrera: string; siglas: string }[];
}
