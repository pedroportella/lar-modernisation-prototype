import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WorkstreamCardComponent } from './workstream-card.component';

describe('WorkstreamCardComponent', () => {
  let fixture: ComponentFixture<WorkstreamCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorkstreamCardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(WorkstreamCardComponent);
    fixture.componentRef.setInput('priority', 1);
    fixture.componentRef.setInput('status', 'OnTrack');
    fixture.componentRef.setInput('title', 'Payments');
    fixture.componentRef.setInput('summary', 'Migration readiness');
  });

  it('creates', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });
});
