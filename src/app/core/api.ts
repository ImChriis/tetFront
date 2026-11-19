import { HttpErrorResponse } from '@angular/common/http';

export const API_URL = 'http://localhost/tetBack/api';

/** Mensaje legible de un error de tetBack, que responde { error: '...' } */
export function mensajeError(e: unknown) {
  return (e instanceof HttpErrorResponse && e.error?.error) || 'No se pudo completar la operación. Intenta de nuevo.';
}
