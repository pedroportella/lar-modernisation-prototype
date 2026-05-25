import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PageAlertComponent } from './page-alert.component';

describe('PageAlertComponent', () => {
  let fixture: ComponentFixture<PageAlertComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PageAlertComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PageAlertComponent);
  });

  it('creates', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });
});
