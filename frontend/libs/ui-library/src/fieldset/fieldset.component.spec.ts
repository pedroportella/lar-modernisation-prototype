import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FieldsetComponent } from './fieldset.component';

describe('FieldsetComponent', () => {
  let fixture: ComponentFixture<FieldsetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FieldsetComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(FieldsetComponent);
    fixture.componentRef.setInput('legend', 'Legend');
  });

  it('creates', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });
});
