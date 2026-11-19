import { Injectable } from '@angular/core';
import { MatPaginatorIntl } from '@angular/material/paginator';

@Injectable()
export class PaginadorEs extends MatPaginatorIntl {
  override itemsPerPageLabel = 'Por página:';
  override nextPageLabel = 'Página siguiente';
  override previousPageLabel = 'Página anterior';
  override firstPageLabel = 'Primera página';
  override lastPageLabel = 'Última página';
  override getRangeLabel = (page: number, size: number, total: number) =>
    total === 0 ? '0 de 0' : `${page * size + 1} – ${Math.min((page + 1) * size, total)} de ${total}`;
}
