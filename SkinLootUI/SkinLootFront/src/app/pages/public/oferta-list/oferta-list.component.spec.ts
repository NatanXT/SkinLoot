import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OfertaListComponent } from './oferta-list.component';

describe('OfertaListComponent', () => {
  let component: OfertaListComponent;
  let fixture: ComponentFixture<OfertaListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OfertaListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OfertaListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
