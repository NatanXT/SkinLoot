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

  constructor(private skinService: SkinService) {}

  ngOnInit(): void {
    this.skinService.listar().subscribe({
      next: (res) => this.skins = res,
      error: (err) => console.error('Erro ao carregar skins:', err)
    });
  }

  getRaridadeClasse(raridade: string): string {
    switch (raridade.toUpperCase()) {
      case 'LENDÁRIO': return 'legendary';
      case 'ÉPICO': return 'epic';
      case 'RARO': return 'rare';
      case 'COMUM': return 'common';
      default: return '';
    }
  }

  getQualidadeClasse(qualidade: string | undefined): string {
    if (!qualidade) return '';
    const k = qualidade.toUpperCase();
    if (k.includes('nova')) return 'nova';
    if (k.includes('pouco')) return 'pouco-usada';
    if (k.includes('campo') || k.includes('testada')) return 'usada';
    if (k.includes('bem') || k.includes('desgastada')) return 'muito-usada';
    return '';
  }

  protected readonly formatDate = formatDate;
}
