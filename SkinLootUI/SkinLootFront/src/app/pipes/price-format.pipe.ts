import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'priceFormat',
  standalone: true
})
export class PriceFormatPipe implements PipeTransform {
  transform(value: string | undefined | null): string {
    // Se o valor for nulo, indefinido ou vazio, retorna 'N/A'
    if (!value) {
      return 'N/A';
    }

    // Converte a string de centavos para um número
    const numericValue = Number(value);

    // Se não for um número válido, retorna 'N/A'
    if (isNaN(numericValue)) {
      return 'N/A';
    }

    // Divide por 100 para obter o valor em dólares
    const dollars = numericValue / 100;

    // Formata para ter duas casas decimais
    return dollars.toFixed(2);
  }
}
