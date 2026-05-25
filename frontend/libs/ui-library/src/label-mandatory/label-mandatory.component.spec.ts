import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LabelMandatoryComponent } from './label-mandatory.component';

describe('LabelMandatoryComponent', () => {
  let fixture: ComponentFixture<LabelMandatoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LabelMandatoryComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(LabelMandatoryComponent);
  });

  it('creates', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });
});
