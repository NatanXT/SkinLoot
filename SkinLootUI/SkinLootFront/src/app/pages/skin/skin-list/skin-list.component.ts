import {Component, OnInit} from '@angular/core';
import {Anuncio} from "../../../model/anuncio";
import {DecimalPipe, formatDate, NgClass, NgForOf, NgIf, TitleCasePipe} from "@angular/common";
import {AnuncioService} from "../../../service/anuncio.service";
import {Skin} from "../../../model/skin";
import {SkinService} from "../../../service/skin.service";
import {RouterLink, RouterOutlet} from "@angular/router";
import {DmarketService} from "../../../service/dmarket.service";
import {SteamService} from "../../../service/steam.service";

@Component({
  selector: 'app-skin-list',
  standalone: true,
  imports: [
    NgClass,
    NgIf,
    NgForOf,
    DecimalPipe,
    RouterLink,
    RouterOutlet,
    TitleCasePipe
  ],
  templateUrl: './skin-list.component.html',
  styleUrl: './skin-list.component.css'
})
export class SkinListComponent implements OnInit{
  inventoryItems: any[] = [];
  isLoading = false;

  // 2. Injete o SteamService
  constructor(private steamService: SteamService) {}

  ngOnInit(): void {
    this.carregarInventario();
  }

  carregarInventario(): void {
    this.isLoading = true;

    // 3. Use o SteamID para o qual você gerou a resposta de teste
    const steamId = '76561198249830134';

    // 4. Chame o novo método do serviço
    this.steamService.getInventory(steamId).subscribe({
      next: (response) => {
        // A resposta do seu backend já é a lista de itens enriquecidos
        this.inventoryItems = response;
        this.isLoading = false;
        console.log('Inventário Enriquecido Recebido:', this.inventoryItems);
      },
      error: (err) => {
        console.error('Erro ao carregar inventário da Steam:', err);
        this.isLoading = false;
      }
    });
  }
}
