import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CriarSkinComponent } from './criar-skin.component';

describe('CriarSkinComponent', () => {
  let component: CriarSkinComponent;
  let fixture: ComponentFixture<CriarSkinComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CriarSkinComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CriarSkinComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
