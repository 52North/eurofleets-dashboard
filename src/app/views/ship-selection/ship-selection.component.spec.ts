import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ShipSelectionComponent } from './ship-selection.component';

describe('ShipSelectionComponent', () => {
  let component: ShipSelectionComponent;
  let fixture: ComponentFixture<ShipSelectionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ShipSelectionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ShipSelectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
