import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BootScreen } from './boot-screen';

describe('BootScreen', () => {
  let component: BootScreen;
  let fixture: ComponentFixture<BootScreen>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BootScreen],
    }).compileComponents();

    fixture = TestBed.createComponent(BootScreen);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
