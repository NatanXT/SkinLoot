import { TestBed } from '@angular/core/testing';

import { DmarketService } from './dmarket.service';

describe('DmarketService', () => {
  let service: DmarketService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DmarketService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
