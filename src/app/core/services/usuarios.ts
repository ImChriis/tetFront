import { HttpClient } from '@angular/common/http';
import { Service, inject } from '@angular/core';
import { API_URL } from '../api';
import { Usuario } from '../models/usuario';

export type DatosUsuario = Omit<Usuario, 'id' | 'rol'> & { contrasena?: string };

@Service()
export class UsuariosApi {
  private readonly http = inject(HttpClient);
  private readonly url = `${API_URL}/usuarios/`;

  listar() {
    return this.http.get<Usuario[]>(this.url);
  }

  crear(datos: DatosUsuario) {
    return this.http.post<Usuario>(this.url, datos);
  }

  editar(id: number, datos: DatosUsuario) {
    return this.http.put<Usuario>(this.url, datos, { params: { id } });
  }

  eliminar(id: number) {
    return this.http.delete<{ ok: true }>(this.url, { params: { id } });
  }
}
