import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DmarketConnectComponent } from './dmarket-connect.component';

describe('DmarketConnectComponent', () => {
  let component: DmarketConnectComponent;
  let fixture: ComponentFixture<DmarketConnectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DmarketConnectComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DmarketConnectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
