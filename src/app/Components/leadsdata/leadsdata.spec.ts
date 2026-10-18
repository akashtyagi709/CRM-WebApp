import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Leadsdata } from './leadsdata';

describe('Leadsdata', () => {
  let component: Leadsdata;
  let fixture: ComponentFixture<Leadsdata>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Leadsdata]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Leadsdata);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
