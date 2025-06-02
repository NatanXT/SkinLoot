import {Component, OnInit} from '@angular/core';
import {AnuncioResponse} from "../../model/anuncio";
import {AnuncioService} from "../../service/anuncio.service";
import {MatCard, MatCardActions, MatCardContent, MatCardHeader, MatCardModule} from "@angular/material/card";
import {MatButton, MatButtonModule} from "@angular/material/button";
import {RouterLink, RouterModule} from "@angular/router";
import {CommonModule, DatePipe, NgForOf} from "@angular/common";

@Component({
  selector: 'app-anuncio-list',
  standalone: true,
  imports: [
    CommonModule, RouterModule, MatCardModule, MatButtonModule,
    RouterLink,
    DatePipe,
    NgForOf
  ],
  templateUrl: './anuncio-list.component.html',
  styleUrl: './anuncio-list.component.css'
})
export class AnuncioListComponent implements OnInit{


  anuncios: AnuncioResponse[] = [];

  constructor(private anuncioService: AnuncioService) { }

  ngOnInit(): void {
    this.anuncioService.listarAnuncios().subscribe({
      next: data => this.anuncios = data,
      error: err => console.error('Erro ao buscar anúncios:', err)
    });
  }
}
