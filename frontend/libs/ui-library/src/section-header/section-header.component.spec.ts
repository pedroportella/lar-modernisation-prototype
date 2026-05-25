import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SectionHeaderComponent } from './section-header.component';

describe('SectionHeaderComponent', () => {
  let fixture: ComponentFixture<SectionHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SectionHeaderComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SectionHeaderComponent);
  });

  it('creates', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });
});
