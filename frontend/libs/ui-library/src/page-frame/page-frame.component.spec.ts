import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PageFrameComponent } from './page-frame.component';

describe('PageFrameComponent', () => {
  let fixture: ComponentFixture<PageFrameComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PageFrameComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PageFrameComponent);
  });

  it('creates', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });
});
