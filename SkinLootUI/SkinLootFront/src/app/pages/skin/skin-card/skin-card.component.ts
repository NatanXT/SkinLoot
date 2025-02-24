import { Component } from '@angular/core';
import {Skin} from "../../../model/skin";
import {NgClass, NgForOf} from "@angular/common";

@Component({
  selector: 'app-skin-card',
  standalone: true,
  imports: [
    NgClass,
    NgForOf
  ],
  templateUrl: './skin-card.component.html',
  styleUrl: './skin-card.component.css'
})
export class SkinCardComponent {
 popularskins: Skin[] = [
   {
     nome: 'gold',
     preco: 2000,
     imagem: 'https://imgs.search.brave.com/iYLh7IFsvRcn-utRple-TeDxw5XbPUhsHkcFEOVQAkw/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly93d3cu/cGV0ei5jb20uYnIv/Y2FjaG9ycm8vcmFj/YXMvZ29sZGVuLXJl/dHJpZXZlci9pbWcv/Z29sZGVuLXJldHJp/ZXZlci1maWxob3Rl/LmpwZw',
     raridade: 'legendario'
   },
   {
     nome: 'black',
     preco: 600,
     imagem: 'https://imgs.search.brave.com/J34IPmLNP1kJ3LV6l3zlyw6G-7fZeo8r-7OqKcX0uN0/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9saWRl/cmRhbWF0aWxoYS5m/Yml0c3N0YXRpYy5u/ZXQvbWVkaWEvYWxl/bWFvLWZvZmluaG8x/LmpwZw',
     raridade: 'raro'
   },
   {
     nome: 'mancha',
     preco: 1400,
     imagem: 'https://imgs.search.brave.com/UoHckVWCbwv0Em2mVVQbMTygn4bVD39lCKlnalCe9no/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9jZG4w/LnBlcml0b2FuaW1h/bC5jb20uYnIvcHQv/cmF6YXMvNC82LzUv/ZG9ndWUtYWxlbWFv/XzU2NF8wXzYwMC5q/cGc',
     raridade: 'epico'
   }
 ];

  recentskins: Skin[] = [
    {
      nome: 'gold',
      preco: 2000,
      imagem: 'https://imgs.search.brave.com/iYLh7IFsvRcn-utRple-TeDxw5XbPUhsHkcFEOVQAkw/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly93d3cu/cGV0ei5jb20uYnIv/Y2FjaG9ycm8vcmFj/YXMvZ29sZGVuLXJl/dHJpZXZlci9pbWcv/Z29sZGVuLXJldHJp/ZXZlci1maWxob3Rl/LmpwZw',
      raridade: 'legendario'
    },
    {
      nome: 'black',
      preco: 600,
      imagem: 'https://imgs.search.brave.com/J34IPmLNP1kJ3LV6l3zlyw6G-7fZeo8r-7OqKcX0uN0/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9saWRl/cmRhbWF0aWxoYS5m/Yml0c3N0YXRpYy5u/ZXQvbWVkaWEvYWxl/bWFvLWZvZmluaG8x/LmpwZw',
      raridade: 'raro'
    },
    {
      nome: 'mancha',
      preco: 1400,
      imagem: 'https://imgs.search.brave.com/UoHckVWCbwv0Em2mVVQbMTygn4bVD39lCKlnalCe9no/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9jZG4w/LnBlcml0b2FuaW1h/bC5jb20uYnIvcHQv/cmF6YXMvNC82LzUv/ZG9ndWUtYWxlbWFv/XzU2NF8wXzYwMC5q/cGc',
      raridade: 'epico'
    }
  ];
}
