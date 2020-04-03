import { TestBed } from '@angular/core/testing';

import { ShipSelectionResolverService } from './ship-selection-resolver.service';

describe('ShipSelectionResolverService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ShipSelectionResolverService = TestBed.get(ShipSelectionResolverService);
    expect(service).toBeTruthy();
  });
});
