import { HttpClient } from '@angular/common/http';
import { Service, inject } from '@angular/core';
import { API_URL } from '../api';
import { Carrera, Facultad, LineaAmbito, LineaMatriz, LineaOperativa, LineaPotencial } from '../models/catalogos';
import { Rol } from '../models/usuario';

export interface TiposCatalogo {
  facultades: Facultad;
  carreras: Carrera;
  matrices: LineaMatriz;
  ambitos: LineaAmbito;
  potenciales: LineaPotencial;
  operativas: LineaOperativa;
  roles: Rol;
}

@Service()
export class CatalogosApi {
  private readonly http = inject(HttpClient);

  listar<T extends keyof TiposCatalogo>(tipo: T) {
    return this.http.get<TiposCatalogo[T][]>(`${API_URL}/catalogos/`, { params: { tipo } });
  }

  crear<T extends keyof TiposCatalogo>(tipo: T, datos: Omit<TiposCatalogo[T], 'id'>) {
    return this.http.post<TiposCatalogo[T]>(`${API_URL}/catalogos/`, datos, { params: { tipo } });
  }

  editar<T extends keyof TiposCatalogo>(tipo: T, id: number, datos: Omit<TiposCatalogo[T], 'id'>) {
    return this.http.put<TiposCatalogo[T]>(`${API_URL}/catalogos/`, datos, { params: { tipo, id } });
  }

  eliminar(tipo: keyof TiposCatalogo, id: number) {
    return this.http.delete<{ ok: true }>(`${API_URL}/catalogos/`, { params: { tipo, id } });
  }
}
