import {Component, OnInit} from '@angular/core';
import {OfertaSkinCS2} from "../../../model/skin";
import {HttpClient} from "@angular/common/http";
import {FormsModule} from "@angular/forms";
import {NgForOf} from "@angular/common";

@Component({
  selector: 'app-oferta-list',
  standalone: true,
  imports: [
    FormsModule,
    NgForOf
  ],
  templateUrl: './oferta-list.component.html',
  styleUrl: './oferta-list.component.css'
})
export class OfertaListComponent implements OnInit {
  ofertas: OfertaSkinCS2[] = [];
  ofertasFiltradas: OfertaSkinCS2[] = [];
  filtroNome: string = '';
  filtroPrecoMax: number | null = null;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.http.get<OfertaSkinCS2[]>('http://localhost:8080/ofertas').subscribe(data => {
      this.ofertas = data;
      this.aplicarFiltros();
    });
  }

  aplicarFiltros(): void {
    this.ofertasFiltradas = this.ofertas.filter(oferta => {
      const nomeMatch = oferta.name.toLowerCase().includes(this.filtroNome.toLowerCase());
      const precoMatch = this.filtroPrecoMax == null || oferta.priceMin <= this.filtroPrecoMax;
      return nomeMatch && precoMatch;
    });
  }

  protected readonly encodeURIComponent = encodeURIComponent;
}
