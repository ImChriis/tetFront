export interface Rol {
  id: number;
  rol: string;
}

export interface Usuario {
  id: number;
  nombre: string;
  apellido: string;
  cedula: string;
  correo: string;
  usuario: string;
  rol_id: number;
}
