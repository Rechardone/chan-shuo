import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { DashboardViewModel, MOCK_DASHBOARD } from './market-dashboard.data';

@Injectable({ providedIn: 'root' })
export class MarketDashboardService {
  loadDashboard(): Observable<DashboardViewModel> {
    // Batch 05 keeps the desktop on mock data. Batch 06 can replace this
    // with a Tauri command that reads SQLite from the local data directory.
    return of(MOCK_DASHBOARD);
  }
}
