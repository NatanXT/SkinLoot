import { Component } from '@angular/core';
import {Anuncio} from "../../../model/anuncio";

@Component({
  selector: 'app-skin-list',
  standalone: true,
  imports: [],
  templateUrl: './skin-list.component.html',
  styleUrl: './skin-list.component.css'
})
export class SkinListComponent {

      anuncioList: Anuncio[] = [
        {
          id: +'1',
          skin: {
            nome: 'AWP | Dragon Lore',
            preco:  9500,
            imagem: 'https://imgs.search.brave.com/hoGUYz9_6jMxpGfQvXKEJQZGR_LPXx_O_lrwRVxgLb4/rs:fit:860:0:0/g:ce/aHR0cHM6Ly93YWxs/cGFwZXJhY2Nlc3Mu/Y29tL2Z1bGwvMTY5/NzEwNy5qcGc',
            raridade: 'legendario'
          },
          preco: 3000,
          descricao: 'um raro item',
          dataPublicacao: new Date('2025-03-15'),
          status: 'DISPONIVEL'
        }
      ]
}
