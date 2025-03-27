import {Component, OnInit} from '@angular/core';
import {Anuncio} from "../../../model/anuncio";
import {formatDate, NgClass, NgForOf, NgIf} from "@angular/common";
import {AnuncioService} from "../../../service/anuncio.service";

@Component({
  selector: 'app-skin-list',
  standalone: true,
  imports: [
    NgClass,
    NgIf,
    NgForOf
  ],
  templateUrl: './skin-list.component.html',
  styleUrl: './skin-list.component.css'
})
export class SkinListComponent implements OnInit{
  anuncios: Anuncio[] =[];
    constructor(private anuncioService: AnuncioService){

    }
    ngOnInit(): void{
      this.anuncioService.listarAnuncios().subscribe(
        data => {
          this.anuncios = data;
        },
        error => console.log('fudeu',error)
      )
    }
      //essa logica de anuncio esta errada
      // anuncioList: Anuncio[] = [
      //   {
      //     id: +'1',
      //     skin: {
      //       nome: 'AWP | Dragon Lore',
      //       preco:  9500,
      //       imagem: 'https://imgs.search.brave.com/9QLGxAPbbEXbMLJfQWhPCESWbGdXkdDmnV5Tf91fPDw/rs:fit:500:0:0:0/g:ce/aHR0cHM6Ly9jZG4u/Y3Nnb3NraW5zLmdn/L3B1YmxpYy91aWgv/cHJvZHVjdHMvYUhS/MGNITTZMeTlqYjIx/dGRXNXBkSGt1WTJ4/dmRXUm1iR0Z5WlM1/emRHVmhiWE4wWVhS/cFl5NWpiMjB2WldO/dmJtOXRlUzlwYldG/blpTOHRPV0U0TVdS/c1YweDNTakpWVlVk/alZuTmZibk5XZEhw/a1QwVmtkRmQzUzBk/YVdreFJTRlI0UkZv/M1NUVTJTMVV3V25k/M2J6Uk9WVmcwYjBa/S1drVklUR0pZU0RW/QmNHVlBORmx0Ykdo/NFdWRnJia05TZGtO/dk1EUkVSVlpzZUd0/TFozQnZkRFl5TVVa/QlVqRTNVRGRPWkZS/U1NDMTBNalp4TkZO/YWJIWkVOMUJaVkZG/bldIUjFOVTE0TW1k/Mk1sQnlaRk5wYWtG/WGQzRnJWblJPTWpj/eVNrbEhaRXAzTkRa/WlZuSlpjVlpQTTNo/TWVTMW5Ta001ZFRW/MlFubERRbWcyZVdk/cE4xZEhaSGRWUzFS/WlpGSkVPRUUtL2F1/dG8vYXV0by84NS9u/b3RyaW0vYmViYTkx/ZWU5NDhlNTk4YmNh/Mjg5YjlkMjM0ZWE2/MmMucG5n',
      //       raridade: 'legendario'
      //     },
      //     descricao: 'um raro item',
      //     dataPublicacao: new Date('2025-03-15'),
      //     status: 'DISPONIVEL'
      //   },
      //   {
      //     id: +'2',
      //     skin: {
      //       nome: 'AK-47 | Asiimov',
      //       preco:  4000,
      //       imagem: 'https://imgs.search.brave.com/_4RafLnVNrXIdYphT1KMmA_X9e8bcor54lQyBwxD-ok/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9jZG4u/c2tpbmJhcm9uLmRl/L3N0ZWFtZGF0YS9l/Y29ub215L2ltYWdl/Ly05YTgxZGxXTHdK/MlVVR2NWc19uc1Z0/emRPRWR0V3dLR1pa/TFFIVHhEWjdJNTZL/VTBad3dvNE5VWDRv/RkpaRUhMYlhINUFw/ZU80WW1saHhZUWtu/Q1J2Q28wNERFVmx4/a0tncG90N0h4ZkRo/anhzekplbWtWMDky/bG5ZbUdtT0hMUHI3/Vm4zNWNwcGNoM0xH/UnJJLW4yZ1R0X0VK/a2EyQ21KNGFUY2xC/c1kxclhxMUszbC1t/OTA1QzF1OHZQejNO/OS1uNTF0VEFReUpv/P29wdGltaXplcj1p/bWFnZQ',
      //       raridade: 'epico'
      //     },
      //     descricao: 'ak bolada',
      //     dataPublicacao: new Date('2025-02-28'),
      //     status: 'DISPONIVEL'
      //   },
      //   {
      //     id: +'3',
      //     skin: {
      //       nome: 'K/DA ALL OUT Ahri',
      //       preco:  2300,
      //       imagem: 'https://imgs.search.brave.com/5BxHKrGqPIfe4bfWeqpSRJlftB1lNmAqDxAIhVpB0SU/rs:fit:500:0:0:0/g:ce/aHR0cHM6Ly9zdGF0/aWMud2lraWEubm9j/b29raWUubmV0L2xv/bGVzcG9ydHNfZ2Ft/ZXBlZGlhX2VuL2lt/YWdlcy9iL2IwL1Nr/aW5fTG9hZGluZ19T/Y3JlZW5fS0RBX0Fo/cmkuanBnL3Jldmlz/aW9uL2xhdGVzdD9j/Yj0yMDI0MTAyNTE0/MzQ0NQ.jpeg',
      //       raridade: 'legendario'
      //     },
      //     descricao: 'lolzeiro nem é gente',
      //     dataPublicacao: new Date('2025-02-27'),
      //     status: 'DISPONIVEL'
      //   },
      //   {
      //     id: +'4',
      //     skin: {
      //       nome: 'Golden Dominus',
      //       preco:  2300,
      //       imagem: 'https://imgs.search.brave.com/pMwfzyccfCnsMzO8te8dsEYVUl9jf2duehpapmPN960/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9pbWFn/ZXMtbmEuc3NsLWlt/YWdlcy1hbWF6b24u/Y29tL2ltYWdlcy9J/LzYxMmtlYitHRFFM/LmpwZw',
      //       raridade: 'legendario'
      //     },
      //     descricao: 'roblox',
      //     dataPublicacao: new Date('2025-02-27'),
      //     status: 'DISPONIVEL'
      //   },
      //   {
      //     id: +'5',
      //     skin: {
      //       nome: 'M4A4 | Howl',
      //       preco:  7500,
      //       imagem: 'https://imgs.search.brave.com/k4-okTHo1AA7C7MGKSyWy1LAnyZhNfRGIseGfDOIcqo/rs:fit:500:0:0:0/g:ce/aHR0cHM6Ly9jZG4u/Y3Nnb3NraW5zLmdn/L3B1YmxpYy91aWgv/cHJvZHVjdHMvYUhS/MGNITTZMeTlqYjIx/dGRXNXBkSGt1WTJ4/dmRXUm1iR0Z5WlM1/emRHVmhiWE4wWVhS/cFl5NWpiMjB2WldO/dmJtOXRlUzlwYldG/blpTOHRPV0U0TVdS/c1YweDNTakpWVlVk/alZuTmZibk5XZEhw/a1QwVmtkRmQzUzBk/YVdreFJTRlI0UkZv/M1NUVTJTMVV3V25k/M2J6Uk9WVmcwYjBa/S1drVklUR0pZU0RW/QmNHVlBORmx0Ykdo/NFdWRnJia05TZGtO/dk1EUkVSVlpzZUd0/TFozQnZkUzAyYTJW/cWFHcDRjM3BHU2xS/M1ZEQTVVelZuTkhs/RGJXWkVURkEzVEZk/dWJqaG1ObkJKYkRJ/dGVWbHdPVk51YWtF/eU15MUNRblZPVnkx/cFRFa3RXRXBuUm5O/YVVYbEhYMVpYTW14/UGNUa3hPR1U0ZFhO/NlRHNHlkMm8xU0dW/QmRtdFdaSFJSL2F1/dG8vYXV0by84NS9u/b3RyaW0vOTFkN2E3/YmRkOGJiZGU0YmI5/YTI2NzM2OTdiZDYx/ZDgucG5n',
      //       raridade: 'legendario'
      //     },
      //     descricao: 'csgo',
      //     dataPublicacao: new Date('2025-02-27'),
      //     status: 'DISPONIVEL'
      //   },
      //   {
      //     id: +'6',
      //     skin: {
      //       nome: 'Star Guardian Lux',
      //       preco:  3000,
      //       imagem: 'https://imgs.search.brave.com/g7AhTyYca8vMwU3CJC6IRktw45jnZhogd2gkECsVhZs/rs:fit:500:0:0:0/g:ce/aHR0cHM6Ly9zdGF0/aWMud2lraWEubm9j/b29raWUubmV0L2xv/bGVzcG9ydHNfZ2Ft/ZXBlZGlhX2VuL2lt/YWdlcy9iL2I3L1Nr/aW5fU3BsYXNoX1N0/YXJfR3VhcmRpYW5f/THV4LmpwZy9yZXZp/c2lvbi9sYXRlc3Q_/Y2I9MjAxOTEyMTAw/NTI5NDA.jpeg',
      //       raridade: 'legendario'
      //     },
      //     descricao: 'LOL',
      //     dataPublicacao: new Date('2025-02-28'),
      //     status: 'DISPONIVEL'
      //   }]


  protected readonly formatDate = formatDate;
}
