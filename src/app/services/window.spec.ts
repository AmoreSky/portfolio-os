import { TestBed } from '@angular/core/testing';

import { Window } from './window';

describe('Window', () => {
  let service: Window;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Window);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
