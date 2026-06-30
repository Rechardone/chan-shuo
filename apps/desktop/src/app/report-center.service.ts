import { Injectable } from '@angular/core';
import { from, Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { invoke } from '@tauri-apps/api/core';

export interface ReportFileView {
  name: string;
  path: string;
  size_bytes: number;
  modified_at: string;
}

export interface ReportContentView extends ReportFileView {
  content: string;
}

@Injectable({ providedIn: 'root' })
export class ReportCenterService {
  listReports(): Observable<ReportFileView[]> {
    return from(invoke<ReportFileView[]>('list_reports')).pipe(
      catchError(() => of([]))
    );
  }

  readReport(name: string): Observable<ReportContentView | undefined> {
    return from(invoke<ReportContentView>('read_report', { name })).pipe(
      catchError(() => of(undefined))
    );
  }

  openReportsDir(): Observable<string> {
    return from(invoke<string>('open_reports_dir')).pipe(
      catchError((error) => of(String(error)))
    );
  }
}
