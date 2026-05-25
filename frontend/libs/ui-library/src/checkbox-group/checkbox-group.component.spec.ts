import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CheckboxGroupComponent } from './checkbox-group.component';

describe('CheckboxGroupComponent', () => {
  let fixture: ComponentFixture<CheckboxGroupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CheckboxGroupComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(CheckboxGroupComponent);
    fixture.componentRef.setInput('legend', 'Choices');
    fixture.componentRef.setInput('name', 'choices');
    fixture.componentRef.setInput('options', [{ label: 'One', value: 'one' }]);
  });

  it('creates', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });
});
