import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { larMockApiInterceptor } from '@lar/services';
import { of } from 'rxjs';
import { FeatureSlicePageComponent } from './feature-slice-page.component';

describe(FeatureSlicePageComponent.name, () => {
  beforeEach(async () => {
    window.larRuntimeConfig = {
      apiBaseUrl: 'mock',
      mockApi: true,
      role: 'DeliveryLead',
    };

    await TestBed.configureTestingModule({
      imports: [FeatureSlicePageComponent],
      providers: [
        provideHttpClient(withInterceptors([larMockApiInterceptor])),
        {
          provide: ActivatedRoute,
          useValue: {
            data: of({ slice: 'payments' }),
          },
        },
      ],
    }).compileComponents();
  });

  afterEach(() => {
    window.larRuntimeConfig = undefined;
    TestBed.resetTestingModule();
  });

  it('shows validation errors for the status review workflow', async () => {
    const fixture = TestBed.createComponent(FeatureSlicePageComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const form = fixture.nativeElement.querySelector(
      '.workflow-form',
    ) as HTMLFormElement;
    const note = fixture.nativeElement.querySelector(
      '#workflow-note',
    ) as HTMLTextAreaElement;
    const reviewer = fixture.nativeElement.querySelector(
      '#workflow-reviewed-by',
    ) as HTMLInputElement;

    note.value = 'short';
    note.dispatchEvent(new Event('input'));
    reviewer.value = '';
    reviewer.dispatchEvent(new Event('input'));
    form.dispatchEvent(new Event('submit'));
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain(
      'Add a note of at least 12 characters.',
    );
    expect(fixture.nativeElement.textContent).toContain(
      'Enter the reviewer or role.',
    );
  });

  it('applies a saved review to the selected record after the API responds', async () => {
    const fixture = TestBed.createComponent(FeatureSlicePageComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const status = fixture.nativeElement.querySelector(
      '#workflow-status',
    ) as HTMLSelectElement;
    const action = fixture.nativeElement.querySelector(
      '#workflow-action',
    ) as HTMLInputElement;
    const note = fixture.nativeElement.querySelector(
      '#workflow-note',
    ) as HTMLTextAreaElement;
    const reviewer = fixture.nativeElement.querySelector(
      '#workflow-reviewed-by',
    ) as HTMLInputElement;
    const form = fixture.nativeElement.querySelector(
      '.workflow-form',
    ) as HTMLFormElement;

    status.value = 'Blocked';
    status.dispatchEvent(new Event('change'));
    action.value = 'Escalate cutover dependency';
    action.dispatchEvent(new Event('input'));
    note.value = 'Reviewed with release lead and dependency owner.';
    note.dispatchEvent(new Event('input'));
    reviewer.value = 'Delivery lead';
    reviewer.dispatchEvent(new Event('input'));
    form.dispatchEvent(new Event('submit'));

    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Saving review...');

    await fixture.whenStable();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain(
      'Review saved to backend.',
    );
    expect(fixture.nativeElement.textContent).toContain(
      'Escalate cutover dependency',
    );
    expect(fixture.nativeElement.textContent).toContain('Blocked');
  });

  it('does not offer save controls for viewer role', async () => {
    TestBed.resetTestingModule();
    window.larRuntimeConfig = {
      apiBaseUrl: 'mock',
      mockApi: true,
      role: 'Viewer',
    };

    await TestBed.configureTestingModule({
      imports: [FeatureSlicePageComponent],
      providers: [
        provideHttpClient(withInterceptors([larMockApiInterceptor])),
        {
          provide: ActivatedRoute,
          useValue: {
            data: of({ slice: 'payments' }),
          },
        },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(FeatureSlicePageComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Read-only role');
    expect(fixture.nativeElement.textContent).not.toContain('Save review');
  });
});
