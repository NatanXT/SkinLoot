import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnuncioDetalhesComponent } from './anuncio-detalhes.component';

describe('AnuncioDetalhesComponent', () => {
  let component: AnuncioDetalhesComponent;
  let fixture: ComponentFixture<AnuncioDetalhesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnuncioDetalhesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AnuncioDetalhesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
