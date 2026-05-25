import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  PageAlertComponent,
  PageHeaderComponent,
  StatusTagComponent,
  SummaryMetricComponent,
} from '@lar/ui-library';

@Component({
  imports: [PageAlertComponent],
  template: `
    <lar-page-alert tone="error" title="Unable to load" live="assertive">
      Try again after refreshing the operational view.
    </lar-page-alert>
  `,
})
class PageAlertHostComponent {}

describe('ui-library components', () => {
  describe(StatusTagComponent.name, () => {
    let fixture: ComponentFixture<StatusTagComponent>;

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [StatusTagComponent],
      }).compileComponents();

      fixture = TestBed.createComponent(StatusTagComponent);
    });

    it('formats camel-case statuses for display', () => {
      fixture.componentRef.setInput('status', 'AtRisk');

      fixture.detectChanges();

      const tag = fixture.nativeElement.querySelector('.tag') as HTMLElement;
      expect(tag.textContent?.trim()).toBe('At Risk');
      expect(tag.classList.contains('at-risk')).toBe(true);
    });
  });

  describe(PageHeaderComponent.name, () => {
    let fixture: ComponentFixture<PageHeaderComponent>;

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [PageHeaderComponent],
      }).compileComponents();

      fixture = TestBed.createComponent(PageHeaderComponent);
      fixture.componentRef.setInput('eyebrow', 'Overview');
      fixture.componentRef.setInput('title', 'Transformation dashboard');
    });

    it('renders the title, eyebrow and optional summary', () => {
      fixture.componentRef.setInput('headingId', 'dashboard-title');
      fixture.componentRef.setInput('summary', 'Program status across active workstreams.');

      fixture.detectChanges();

      const heading = fixture.nativeElement.querySelector('h1') as HTMLHeadingElement;
      expect(heading.id).toBe('dashboard-title');
      expect(heading.textContent?.trim()).toBe('Transformation dashboard');
      expect(fixture.nativeElement.textContent).toContain('Overview');
      expect(fixture.nativeElement.textContent).toContain('Program status across active workstreams.');
    });
  });

  describe(PageAlertComponent.name, () => {
    let fixture: ComponentFixture<PageAlertHostComponent>;

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [PageAlertHostComponent],
      }).compileComponents();

      fixture = TestBed.createComponent(PageAlertHostComponent);
    });

    it('renders the selected tone, live region and projected content', () => {
      fixture.detectChanges();

      const alert = fixture.nativeElement.querySelector('aside') as HTMLElement;
      expect(alert.classList.contains('au-page-alerts')).toBe(true);
      expect(alert.classList.contains('alert--error')).toBe(true);
      expect(alert.getAttribute('aria-live')).toBe('assertive');
      expect(alert.textContent).toContain('Unable to load');
      expect(alert.textContent).toContain('Try again after refreshing the operational view.');
    });
  });

  describe(SummaryMetricComponent.name, () => {
    let fixture: ComponentFixture<SummaryMetricComponent>;

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [SummaryMetricComponent],
      }).compileComponents();

      fixture = TestBed.createComponent(SummaryMetricComponent);
    });

    it('renders a compact metric label and value', () => {
      fixture.componentRef.setInput('label', 'At-risk workstreams');
      fixture.componentRef.setInput('value', 2);

      fixture.detectChanges();

      const metric = fixture.nativeElement.querySelector('.metric') as HTMLElement;
      expect(metric.textContent).toContain('At-risk workstreams');
      expect(metric.textContent).toContain('2');
    });
  });
});
