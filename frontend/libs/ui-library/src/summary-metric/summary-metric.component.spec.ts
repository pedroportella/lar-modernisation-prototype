import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SummaryMetricComponent } from './summary-metric.component';

describe('SummaryMetricComponent', () => {
  let fixture: ComponentFixture<SummaryMetricComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SummaryMetricComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SummaryMetricComponent);
    fixture.componentRef.setInput('label', 'Records');
    fixture.componentRef.setInput('value', 12);
  });

  it('creates', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });
});
