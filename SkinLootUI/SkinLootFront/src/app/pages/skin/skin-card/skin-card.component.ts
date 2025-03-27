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
     imagem: 'https://imgs.search.brave.com/9QLGxAPbbEXbMLJfQWhPCESWbGdXkdDmnV5Tf91fPDw/rs:fit:500:0:0:0/g:ce/aHR0cHM6Ly9jZG4u/Y3Nnb3NraW5zLmdn/L3B1YmxpYy91aWgv/cHJvZHVjdHMvYUhS/MGNITTZMeTlqYjIx/dGRXNXBkSGt1WTJ4/dmRXUm1iR0Z5WlM1/emRHVmhiWE4wWVhS/cFl5NWpiMjB2WldO/dmJtOXRlUzlwYldG/blpTOHRPV0U0TVdS/c1YweDNTakpWVlVk/alZuTmZibk5XZEhw/a1QwVmtkRmQzUzBk/YVdreFJTRlI0UkZv/M1NUVTJTMVV3V25k/M2J6Uk9WVmcwYjBa/S1drVklUR0pZU0RW/QmNHVlBORmx0Ykdo/NFdWRnJia05TZGtO/dk1EUkVSVlpzZUd0/TFozQnZkRFl5TVVa/QlVqRTNVRGRPWkZS/U1NDMTBNalp4TkZO/YWJIWkVOMUJaVkZG/bldIUjFOVTE0TW1k/Mk1sQnlaRk5wYWtG/WGQzRnJWblJPTWpj/eVNrbEhaRXAzTkRa/WlZuSlpjVlpQTTNo/TWVTMW5Ta001ZFRW/MlFubERRbWcyZVdk/cE4xZEhaSGRWUzFS/WlpGSkVPRUUtL2F1/dG8vYXV0by84NS9u/b3RyaW0vYmViYTkx/ZWU5NDhlNTk4YmNh/Mjg5YjlkMjM0ZWE2/MmMucG5n',
     raridade: 'legendario'
   },
   {
     nome: 'black',
     preco: 600,
     imagem: 'https://imgs.search.brave.com/k4-okTHo1AA7C7MGKSyWy1LAnyZhNfRGIseGfDOIcqo/rs:fit:500:0:0:0/g:ce/aHR0cHM6Ly9jZG4u/Y3Nnb3NraW5zLmdn/L3B1YmxpYy91aWgv/cHJvZHVjdHMvYUhS/MGNITTZMeTlqYjIx/dGRXNXBkSGt1WTJ4/dmRXUm1iR0Z5WlM1/emRHVmhiWE4wWVhS/cFl5NWpiMjB2WldO/dmJtOXRlUzlwYldG/blpTOHRPV0U0TVdS/c1YweDNTakpWVlVk/alZuTmZibk5XZEhw/a1QwVmtkRmQzUzBk/YVdreFJTRlI0UkZv/M1NUVTJTMVV3V25k/M2J6Uk9WVmcwYjBa/S1drVklUR0pZU0RW/QmNHVlBORmx0Ykdo/NFdWRnJia05TZGtO/dk1EUkVSVlpzZUd0/TFozQnZkUzAyYTJW/cWFHcDRjM3BHU2xS/M1ZEQTVVelZuTkhs/RGJXWkVURkEzVEZk/dWJqaG1ObkJKYkRJ/dGVWbHdPVk51YWtF/eU15MUNRblZPVnkx/cFRFa3RXRXBuUm5O/YVVYbEhYMVpYTW14/UGNUa3hPR1U0ZFhO/NlRHNHlkMm8xU0dW/QmRtdFdaSFJSL2F1/dG8vYXV0by84NS9u/b3RyaW0vOTFkN2E3/YmRkOGJiZGU0YmI5/YTI2NzM2OTdiZDYx/ZDgucG5n',
     raridade: 'raro'
   },
   {
     nome: 'mancha',
     preco: 1400,
     imagem: 'https://imgs.search.brave.com/5BxHKrGqPIfe4bfWeqpSRJlftB1lNmAqDxAIhVpB0SU/rs:fit:500:0:0:0/g:ce/aHR0cHM6Ly9zdGF0/aWMud2lraWEubm9j/b29raWUubmV0L2xv/bGVzcG9ydHNfZ2Ft/ZXBlZGlhX2VuL2lt/YWdlcy9iL2IwL1Nr/aW5fTG9hZGluZ19T/Y3JlZW5fS0RBX0Fo/cmkuanBnL3Jldmlz/aW9uL2xhdGVzdD9j/Yj0yMDI0MTAyNTE0/MzQ0NQ.jpeg',
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
