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
  rol: string;
}

/** Usuario de la sesión, como lo devuelve /auth */
export interface UsuarioSesion {
  id: number;
  nombre: string;
  apellido: string;
  usuario: string;
  rol_id: number;
  rol: string;
  es_admin: boolean;
  facultad_id: number | null;
}
