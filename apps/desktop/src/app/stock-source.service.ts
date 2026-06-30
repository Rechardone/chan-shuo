import { Injectable } from '@angular/core';
import { from, Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { invoke } from '@tauri-apps/api/core';

export interface StockSourceStatus {
  default_path: string;
  file_exists: boolean;
  stock_count: number;
  message: string;
}

export interface StockBasicView {
  code: string;
  name: string;
  market: string;
  industry: string;
  updated_at: string;
}

export const DEFAULT_STOCK_SOURCE_STATUS: StockSourceStatus = {
  default_path: '~/Library/Containers/cn.com.10jqka.macstockPro/Data/Documents/stockname/32_0_base.ini',
  file_exists: false,
  stock_count: 0,
  message: 'Preview mode: Tauri datasource is not connected'
};

@Injectable({ providedIn: 'root' })
export class StockSourceService {
  loadStatus(): Observable<StockSourceStatus> {
    return from(this.safeInvoke<StockSourceStatus>('load_stock_source_status')).pipe(
      catchError((error) => of({ ...DEFAULT_STOCK_SOURCE_STATUS, message: this.formatPreviewMessage(error) }))
    );
  }

  importThsStockNames(path?: string): Observable<StockSourceStatus> {
    return from(this.safeInvoke<StockSourceStatus>('import_ths_stock_names', { path })).pipe(
      catchError((error) => of({ ...DEFAULT_STOCK_SOURCE_STATUS, message: this.formatPreviewMessage(error) }))
    );
  }

  searchStocks(query: string, limit = 50): Observable<StockBasicView[]> {
    return from(this.safeInvoke<StockBasicView[]>('search_stocks', { query, limit })).pipe(
      catchError(() => of([]))
    );
  }

  private safeInvoke<T>(command: string, args?: Record<string, unknown>): Promise<T> {
    if (!this.isTauriRuntime()) return Promise.reject(new Error('Not running inside Tauri desktop'));
    if (typeof invoke !== 'function') return Promise.reject(new Error('Tauri invoke is unavailable'));
    return invoke<T>(command, args);
  }

  private isTauriRuntime(): boolean {
    return typeof window !== 'undefined' && Boolean((window as unknown as { __TAURI_INTERNALS__?: unknown }).__TAURI_INTERNALS__);
  }

  private formatPreviewMessage(error: unknown): string {
    const message = error instanceof Error ? error.message : String(error);
    return `Tauri datasource failed: ${message}`;
  }
}
