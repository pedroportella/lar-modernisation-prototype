import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormFieldWrapperComponent } from './form-field-wrapper.component';

describe('FormFieldWrapperComponent', () => {
  let fixture: ComponentFixture<FormFieldWrapperComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormFieldWrapperComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FormFieldWrapperComponent);
    fixture.componentRef.setInput('id', 'field');
    fixture.componentRef.setInput('label', 'Field');
  });

  it('creates', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });
});
