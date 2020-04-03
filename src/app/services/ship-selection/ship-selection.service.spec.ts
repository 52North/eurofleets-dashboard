import { TestBed } from '@angular/core/testing';

import { ShipSelectionService } from './ship-selection.service';

describe('ShipSelectionService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ShipSelectionService = TestBed.get(ShipSelectionService);
    expect(service).toBeTruthy();
  });
});
