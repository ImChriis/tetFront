import { HttpErrorResponse } from '@angular/common/http';

// Ruta relativa: en el servidor tetBack está junto al front; en desarrollo lo reenvía proxy.conf.json
export const API_URL = '/tetBack/api';

/** Mensaje legible de un error de tetBack, que responde { error: '...' } */
export function mensajeError(e: unknown) {
  return (e instanceof HttpErrorResponse && e.error?.error) || 'No se pudo completar la operación. Intenta de nuevo.';
}
