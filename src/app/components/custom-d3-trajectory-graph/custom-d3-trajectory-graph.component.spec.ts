import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomD3TrajectoryGraphComponent } from './custom-d3-trajectory-graph.component';

describe('CustomD3TrajectoryGraphComponent', () => {
  let component: CustomD3TrajectoryGraphComponent;
  let fixture: ComponentFixture<CustomD3TrajectoryGraphComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CustomD3TrajectoryGraphComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomD3TrajectoryGraphComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
