import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MeusAnunciosComponent } from './meus-anuncios.component';

describe('MeusAnunciosComponent', () => {
  let component: MeusAnunciosComponent;
  let fixture: ComponentFixture<MeusAnunciosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MeusAnunciosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MeusAnunciosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
