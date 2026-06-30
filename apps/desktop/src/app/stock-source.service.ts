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
    return from(invoke<StockSourceStatus>('load_stock_source_status')).pipe(
      catchError(() => of(DEFAULT_STOCK_SOURCE_STATUS))
    );
  }

  importThsStockNames(path?: string): Observable<StockSourceStatus> {
    return from(invoke<StockSourceStatus>('import_ths_stock_names', { path })).pipe(
      catchError((error) => of({ ...DEFAULT_STOCK_SOURCE_STATUS, message: String(error) }))
    );
  }
}
