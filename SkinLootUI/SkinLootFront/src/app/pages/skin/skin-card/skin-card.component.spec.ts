import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SkinCardComponent } from './skin-card.component';

describe('SkinCardComponent', () => {
  let component: SkinCardComponent;
  let fixture: ComponentFixture<SkinCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SkinCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SkinCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
