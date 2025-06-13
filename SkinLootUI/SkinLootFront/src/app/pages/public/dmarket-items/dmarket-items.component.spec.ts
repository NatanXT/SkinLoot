import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DmarketItemsComponent } from './dmarket-items.component';

describe('DmarketItemsComponent', () => {
  let component: DmarketItemsComponent;
  let fixture: ComponentFixture<DmarketItemsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DmarketItemsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DmarketItemsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
