import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StatusTagComponent } from './status-tag.component';

describe('StatusTagComponent', () => {
  let fixture: ComponentFixture<StatusTagComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StatusTagComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(StatusTagComponent);
  });

  it('creates', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });
});
