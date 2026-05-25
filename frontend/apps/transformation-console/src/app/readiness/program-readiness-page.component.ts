import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { catchError, map, of, startWith } from 'rxjs';
import { ProgramReadiness, TransformationApiService } from '@lar/services';
import {
  LoadingStateComponent,
  PageAlertComponent,
  PageFrameComponent,
  SectionHeaderComponent,
  StatusTagComponent,
} from '@lar/ui-library';

type ReadinessState =
  | { status: 'loading'; readiness: null }
  | { status: 'ready'; readiness: ProgramReadiness }
  | { status: 'error'; readiness: null };

@Component({
  selector: 'app-program-readiness-page',
  imports: [
    AsyncPipe,
    LoadingStateComponent,
    PageAlertComponent,
    PageFrameComponent,
    SectionHeaderComponent,
    StatusTagComponent,
  ],
  templateUrl: './program-readiness-page.component.html',
  styleUrl: './program-readiness-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProgramReadinessPageComponent {
  private readonly transformationApi = inject(TransformationApiService);

  protected readonly state$ = this.transformationApi.getProgramReadiness().pipe(
    map((readiness) => ({ status: 'ready' as const, readiness })),
    startWith({ status: 'loading', readiness: null } satisfies ReadinessState),
    catchError(() => of({ status: 'error', readiness: null } satisfies ReadinessState)),
  );
}
