import { Component } from '@angular/core';
import {DmarketService} from "../../../service/dmarket.service";
import {MatCard, MatCardImage} from "@angular/material/card";
import {NgForOf, NgIf, NgOptimizedImage} from "@angular/common";
import {MatAnchor} from "@angular/material/button";
import { PriceFormatPipe } from '../../../pipes/price-format.pipe'; // <-- IMPORTE O PIPE


@Component({
  selector: 'app-dmarket-items',
  standalone: true,
  imports: [
    MatCard,
    NgForOf,
    NgIf,
    NgOptimizedImage,
    MatCardImage,
    MatAnchor,
    PriceFormatPipe, // <-- ADICIONE O PIPE AOS IMPORT
  ],
  templateUrl: './dmarket-items.component.html',
  styleUrl: './dmarket-items.component.css'
})
export class DmarketItemsComponent {
  itens: any[] = [];
  loading = false;

  constructor(private dmarketService: DmarketService) {}

  ngOnInit() {
    this.loading = true;

    const params = {
      gameId: 'a8db',       // CSGO
      currency: 'USD',
      limit: '20',
      orderBy: 'title',
      orderDir: 'asc',
    };

    this.dmarketService.listarItensMarketplace(params).subscribe({
      next: (res) => {
        this.itens = res.objects || [];
        this.loading = false;
      },
      error: (err) => {
        console.error('Erro ao carregar itens DMarket', err);
        this.loading = false;
      },
    });
  }
}
