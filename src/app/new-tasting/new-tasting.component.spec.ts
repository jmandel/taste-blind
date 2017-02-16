/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { NewTastingComponent } from './new-tasting.component';

describe('NewTastingComponent', () => {
  let component: NewTastingComponent;
  let fixture: ComponentFixture<NewTastingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [NewTastingComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NewTastingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
