import { TestBed } from '@angular/core/testing';

import { StaMqttInterfaceService } from '../../sta-mqtt-interface.service';

describe('StaMqttInterfaceService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: StaMqttInterfaceService = TestBed.get(StaMqttInterfaceService);
    expect(service).toBeTruthy();
  });
});
