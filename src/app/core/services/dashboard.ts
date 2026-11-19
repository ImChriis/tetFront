import { HttpClient } from '@angular/common/http';
import { Service, inject } from '@angular/core';
import { API_URL } from '../api';
import { Dashboard } from '../models/dashboard';

@Service()
export class DashboardApi {
  private readonly http = inject(HttpClient);

  obtener() {
    return this.http.get<Dashboard>(`${API_URL}/dashboard/`);
  }
}
