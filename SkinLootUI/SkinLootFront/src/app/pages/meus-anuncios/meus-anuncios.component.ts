import {Component, OnInit} from '@angular/core';
import {AnuncioResponse} from "../../model/anuncio";
import {AnuncioService} from "../../service/anuncio.service";
import {MatCard, MatCardActions, MatCardContent, MatCardHeader} from "@angular/material/card";
import {RouterLink} from "@angular/router";
import {DatePipe, NgForOf} from "@angular/common";
import {MatButton} from "@angular/material/button";

@Component({
  selector: 'app-meus-anuncios',
  standalone: true,
  imports: [
    MatCard,
    MatCardHeader,
    MatCardContent,
    MatCardActions,
    RouterLink,
    DatePipe,
    NgForOf,
    MatButton
  ],
  templateUrl: './meus-anuncios.component.html',
  styleUrl: './meus-anuncios.component.css'
})
export class MeusAnunciosComponent{


}
