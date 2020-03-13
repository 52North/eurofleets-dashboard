import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DisplayLiveValueComponent } from './display-live-value.component';

describe('DisplayLiveValueComponent', () => {
  let component: DisplayLiveValueComponent;
  let fixture: ComponentFixture<DisplayLiveValueComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DisplayLiveValueComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DisplayLiveValueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
