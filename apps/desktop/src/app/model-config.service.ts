import { Injectable } from '@angular/core';
import { from, Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { invoke } from '@tauri-apps/api/core';

export interface SavedModelConfig {
  runtime: string;
  provider: string;
  model: string;
  base_url: string;
  api_key_saved_locally: boolean;
}

@Injectable({ providedIn: 'root' })
export class ModelConfigService {
  loadConfig(): Observable<SavedModelConfig> {
    return from(invoke<SavedModelConfig>('load_model_config')).pipe(
      catchError(() => of({ runtime: 'ollama', provider: 'ollama', model: 'gemma3:4b', base_url: 'http://127.0.0.1:11434', api_key_saved_locally: false }))
    );
  }

  saveConfig(config: SavedModelConfig): Observable<SavedModelConfig> {
    return from(invoke<SavedModelConfig>('save_model_config', { config })).pipe(
      catchError(() => of(config))
    );
  }
}
