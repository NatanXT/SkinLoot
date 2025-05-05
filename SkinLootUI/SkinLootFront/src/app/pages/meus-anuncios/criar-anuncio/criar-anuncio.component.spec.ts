import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CriarAnuncioComponent } from './criar-anuncio.component';

describe('CriarAnuncioComponent', () => {
  let component: CriarAnuncioComponent;
  let fixture: ComponentFixture<CriarAnuncioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CriarAnuncioComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CriarAnuncioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
