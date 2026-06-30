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

export const DEFAULT_STOCK_SOURCE_STATUS: StockSourceStatus = {
  default_path: '~/Library/Containers/cn.com.10jqka.macstockPro/Data/Documents/stockname/32_0_base.ini',
  file_exists: false,
  stock_count: 0,
  message: '当前为前端预览模式，未连接 Tauri 数据源'
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

  private safeInvoke<T>(command: string, args?: Record<string, unknown>): Promise<T> {
    if (!this.isTauriRuntime()) {
      return Promise.reject(new Error('当前运行在浏览器预览模式，请用 pnpm desktop:dev 启动 Tauri 桌面端'));
    }
    if (typeof invoke !== 'function') {
      return Promise.reject(new Error('Tauri invoke 不可用，请确认当前窗口是 Tauri App 而不是普通浏览器'));
    }
    return invoke<T>(command, args);
  }

  private isTauriRuntime(): boolean {
    return typeof window !== 'undefined' && Boolean((window as unknown as { __TAURI_INTERNALS__?: unknown }).__TAURI_INTERNALS__);
  }

  private formatPreviewMessage(error: unknown): string {
    const message = error instanceof Error ? error.message : String(error);
    return message.includes('浏览器预览模式') || message.includes('invoke')
      ? message
      : `读取 Tauri 数据源失败：${message}`;
  }
}
