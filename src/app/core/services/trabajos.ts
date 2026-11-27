import { HttpClient } from '@angular/common/http';
import { Service, inject } from '@angular/core';
import { API_URL } from '../api';
import { Estadisticas, FiltrosTrabajos, Pagina, Trabajo } from '../models/trabajo';

@Service()
export class TrabajosApi {
  private readonly http = inject(HttpClient);
  private readonly url = `${API_URL}/trabajos`;

  listar(filtros: FiltrosTrabajos) {
    const params = Object.fromEntries(Object.entries(filtros).filter(([, v]) => v !== undefined && v !== ''));
    return this.http.get<Pagina<Trabajo>>(`${this.url}/`, { params });
  }

  obtener(id: number) {
    return this.http.get<Trabajo>(`${this.url}/`, { params: { id } });
  }

  estadisticas() {
    return this.http.get<Estadisticas>(`${this.url}/estadisticas.php`);
  }

  /** Publica o retira del sitio público; el backend exige que esté completo para publicar */
  publicar(id: number, publicado: boolean) {
    return this.http.post<{ id: number; publicado: boolean }>(`${this.url}/publicar.php`, { publicado }, { params: { id } });
  }

  /** Descarga un archivo con el token de sesión, para ver los de trabajos no publicados */
  blob(url: string) {
    return this.http.get(url, { responseType: 'blob' });
  }

  urlArchivo(id: number, tipo: 'resumen' | 'tesis') {
    return `${this.url}/archivo.php?id=${id}&tipo=${tipo}`;
  }

  /** Imagen de la primera página del trabajo completo */
  urlPortada(id: number) {
    return `${this.url}/portada.php?id=${id}`;
  }

  /** Crea (sin id) o edita; el FormData lleva los campos y los PDF "resumen" y "tesis" */
  guardar(datos: FormData, id?: number) {
    return this.http.post<Trabajo>(`${this.url}/`, datos, { params: id ? { id } : {} });
  }

  eliminar(id: number) {
    return this.http.delete<{ ok: true }>(`${this.url}/`, { params: { id } });
  }
}
