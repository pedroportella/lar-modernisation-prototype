import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RadioGroupComponent } from './radio-group.component';

describe('RadioGroupComponent', () => {
  let fixture: ComponentFixture<RadioGroupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RadioGroupComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(RadioGroupComponent);
    fixture.componentRef.setInput('legend', 'Choice');
    fixture.componentRef.setInput('name', 'choice');
    fixture.componentRef.setInput('options', [{ label: 'One', value: 'one' }]);
  });

  it('creates', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });
});
