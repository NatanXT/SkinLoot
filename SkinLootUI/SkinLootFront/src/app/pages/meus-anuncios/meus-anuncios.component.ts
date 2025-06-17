import {Component, OnInit} from '@angular/core';
import {AnuncioResponse} from "../../model/anuncio";
import {AnuncioService} from "../../service/anuncio.service";
import {MatCard, MatCardActions, MatCardContent, MatCardHeader, MatCardSubtitle, MatCardTitle} from "@angular/material/card";
import {RouterLink} from "@angular/router";
import {DatePipe, NgClass, NgForOf, DecimalPipe} from "@angular/common";
import {MatButton} from "@angular/material/button";
import {MatIcon} from "@angular/material/icon";

@Component({
  selector: 'app-meus-anuncios',
  standalone: true,
  imports: [
    MatCard,
    MatCardHeader,
    MatCardContent,
    MatCardActions,
    MatCardTitle,
    MatCardSubtitle,
    RouterLink,
    DatePipe,
    NgForOf,
    MatButton,
    NgClass,
    MatIcon,
    DecimalPipe
  ],
  templateUrl: './meus-anuncios.component.html',
  styleUrl: './meus-anuncios.component.css'
})
export class MeusAnunciosComponent implements OnInit {
  anuncios: AnuncioResponse[] = [];

  constructor(private anuncioService: AnuncioService) {}

  ngOnInit(): void {
    this.anuncioService.listarAnuncios().subscribe({
      next: data => this.anuncios = data,
      error: err => console.error('Erro ao buscar anúncios:', err)
    });
  }

  trackByAnuncio(index: number, anuncio: AnuncioResponse): string {
    return anuncio.id;
  }
}
