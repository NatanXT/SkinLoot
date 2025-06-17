import { Component } from '@angular/core';
import { DmarketService } from "../../../service/dmarket.service";
import { MatCard, MatCardImage } from "@angular/material/card";
import { NgForOf, NgIf, NgOptimizedImage } from "@angular/common";
import { MatAnchor, MatButton } from "@angular/material/button";
import { PriceFormatPipe } from '../../../pipes/price-format.pipe';
import { MatFormField, MatLabel } from "@angular/material/form-field";
import { FormsModule } from "@angular/forms";
import { MatInput } from "@angular/material/input"; // <-- IMPORTE O PIPE

interface DMarketFilters {
  priceMin?: number;
  priceMax?: number;
  rarities?: string[];
  exteriors?: string[];
  searchTitle?: string;
}

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
    PriceFormatPipe,
    MatFormField,
    MatLabel,
    FormsModule,
    MatButton,
    MatInput,
    // <-- ADICIONE O PIPE AOS IMPORT
  ],
  templateUrl: './dmarket-items.component.html',
  styleUrl: './dmarket-items.component.css'
})
export class DmarketItemsComponent {

  filters: DMarketFilters = {
    priceMin: 0,
    priceMax: 0,
    rarities: [],
    exteriors: [],
    searchTitle: ''
  };

  originalItems: any[] = [];
  items: any[] = [];
  loading = false;

  // 1. Variável para armazenar o texto do campo de busca
  termoBusca: string = '';

  applyFilters(items: any[]): any[] {
    return items.filter(item => {
      const price = parseFloat(item.price?.USD || '0');

      const matchPrice =
        (!this.filters.priceMin || price >= this.filters.priceMin) &&
        (!this.filters.priceMax || price <= this.filters.priceMax);

      const matchRarity =
        !this.filters.rarities?.length || this.filters.rarities.includes(item.extra?.rarity);

      const matchExterior =
        !this.filters.exteriors?.length || this.filters.exteriors.includes(item.extra?.exterior);

      const matchTitle =
        !this.filters.searchTitle ||
        item.title?.toLowerCase().includes(this.filters.searchTitle.toLowerCase());

      return matchPrice && matchRarity && matchExterior && matchTitle;
    });
  }

  constructor(private dmarketService: DmarketService) {}

  ngOnInit() {
    // 2. Chama o método para listar os itens na inicialização do componente
    this.listarItems();
  }

  // 3. Método que executa a busca quando o botão é clicado
  realizarBusca(): void {
    this.listarItems();
  }

  updateFilter(key: keyof DMarketFilters, value: any) {
    this.filters[key] = value;
    this.items = this.applyFilters(this.originalItems);
  }

  // 4. Método principal que agora centraliza a chamada da API
  listarItems(): void {
    this.loading = true;
    this.items = [];

    // CORREÇÃO: Definimos os parâmetros de ordenação FORA do 'if/else'.
    // Assim, eles serão enviados em TODAS as requisições.
    const params: any = {
      gameId: 'a8db',
      currency: 'USD',
      limit: '50',
      orderBy: 'title', // Vamos sempre ordenar por título
      orderDir: 'asc',
    };

    // Adiciona o parâmetro 'title' APENAS se o campo de busca não estiver vazio
    if (this.termoBusca && this.termoBusca.trim() !== '') {
      params.title = this.termoBusca.trim();
    }

    // A chamada do serviço continua a mesma
    this.dmarketService.listarItensMarketplace(params).subscribe({
      next: (res) => {
        this.originalItems = res.objects || [];
        this.items = this.applyFilters(this.originalItems);
        this.loading = false;
      },
      error: (err) => {
        console.error('Erro ao carregar itens DMarket', err);
        this.loading = false;
      },
    });
  }
}
