import { TestBed } from '@angular/core/testing';
import { App } from './app';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';

describe('App', () => {
  beforeEach(async () => {
    window.larRuntimeConfig = {
      apiBaseUrl: 'mock',
      environmentLabel: 'Frontend mock mode',
      mockApi: true,
    };

    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideHttpClient(), provideRouter([])],
    }).compileComponents();
  });

  afterEach(() => {
    window.larRuntimeConfig = undefined;
    TestBed.resetTestingModule();
  });

  it('should render the app shell', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('lar-app-shell')).not.toBeNull();
    expect(compiled.textContent).toContain('Frontend mock mode');
  });
});
