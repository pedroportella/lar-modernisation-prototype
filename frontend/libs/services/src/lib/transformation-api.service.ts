import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { LAR_API_BASE_URL } from './api-config';
import { Workstream, WorkstreamDetail } from './workstream.models';

@Injectable({ providedIn: 'root' })
export class TransformationApiService {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = inject(LAR_API_BASE_URL);

  listWorkstreams(): Observable<Workstream[]> {
    return this.http.get<Workstream[]>(`${this.apiBaseUrl}/api/workstreams`);
  }

  getWorkstream(id: string): Observable<WorkstreamDetail> {
    return this.http.get<WorkstreamDetail>(`${this.apiBaseUrl}/api/workstreams/${id}`);
  }
}
