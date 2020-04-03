import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogShipSelectionComponent } from './dialog-ship-selection.component';

describe('DialogShipSelectionComponent', () => {
  let component: DialogShipSelectionComponent;
  let fixture: ComponentFixture<DialogShipSelectionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DialogShipSelectionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DialogShipSelectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
