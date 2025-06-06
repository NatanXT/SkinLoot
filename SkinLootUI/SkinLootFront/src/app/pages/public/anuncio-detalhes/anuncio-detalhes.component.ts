import { Component } from '@angular/core';
import {AnuncioService} from "../../../service/anuncio.service";
import {ActivatedRoute} from "@angular/router";
import {MatCard, MatCardImage} from "@angular/material/card";
import {DatePipe, NgIf} from "@angular/common";

@Component({
  selector: 'app-anuncio-detalhes',
  standalone: true,
  imports: [
    MatCard,
    DatePipe,
    MatCardImage,
    NgIf
  ],
  templateUrl: './anuncio-detalhes.component.html',
  styleUrl: './anuncio-detalhes.component.css'
})
export class AnuncioDetalhesComponent {
  anuncio: any;

  constructor(
    private route: ActivatedRoute,
    private anuncioService: AnuncioService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    this.anuncioService.buscarPorId(id!).subscribe({
      next: data => this.anuncio = data,
      error: err => console.error('Erro ao buscar anúncio:', err)
    });
  }
}
