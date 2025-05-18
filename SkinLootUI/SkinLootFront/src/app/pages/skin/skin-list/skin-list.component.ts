import {Component, OnInit} from '@angular/core';
import {Anuncio} from "../../../model/anuncio";
import {DecimalPipe, formatDate, NgClass, NgForOf, NgIf} from "@angular/common";
import {AnuncioService} from "../../../service/anuncio.service";
import {Skin} from "../../../model/skin";
import {SkinService} from "../../../service/skin.service";
import {RouterLink, RouterOutlet} from "@angular/router";

@Component({
  selector: 'app-skin-list',
  standalone: true,
  imports: [
    NgClass,
    NgIf,
    NgForOf,
    DecimalPipe,
    RouterLink,
    RouterOutlet
  ],
  templateUrl: './skin-list.component.html',
  styleUrl: './skin-list.component.css'
})
export class SkinListComponent implements OnInit{
  skins: Skin[] = [];
  qualidades = ['NOVA_DE_FABRICA', 'POUCO_USADA', 'TESTADA_EM_CAMPO', 'DESGASTADA', 'BEM_DESGASTADA'];
  raridades = ['COMUM', 'INCOMUM', 'RARO', 'ÉPICO', 'LENDÁRIO'];


  constructor(private skinService: SkinService) {}

  ngOnInit(): void {
    this.skinService.listar().subscribe({
      next: (res) => this.skins = res,
      error: (err) => console.error('Erro ao carregar skins:', err)
    });
  }

  protected readonly formatDate = formatDate;
}
