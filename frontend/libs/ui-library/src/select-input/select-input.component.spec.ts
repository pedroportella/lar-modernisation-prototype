import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SelectInputComponent } from './select-input.component';

describe('SelectInputComponent', () => {
  let fixture: ComponentFixture<SelectInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SelectInputComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(SelectInputComponent);
    fixture.componentRef.setInput('id', 'status');
    fixture.componentRef.setInput('label', 'Status');
    fixture.componentRef.setInput('options', [{ label: 'All', value: 'all' }]);
  });

  it('creates', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });
});
