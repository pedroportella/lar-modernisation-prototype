import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TextInputComponent } from './text-input.component';

describe('TextInputComponent', () => {
  let fixture: ComponentFixture<TextInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TextInputComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(TextInputComponent);
    fixture.componentRef.setInput('id', 'name');
    fixture.componentRef.setInput('label', 'Name');
  });

  it('creates', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });
});
