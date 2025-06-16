import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {DMarketKeyRequest} from "../model/DMarketKeyRequest";
import {Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class DmarketService {

  private apiUrl: string = 'http://localhost:8080';

  constructor(private http: HttpClient) {}

  conectarChaves(dados: DMarketKeyRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/api/dmarket/connect`, dados);
  }

  listarItensMarketplace(params: any): Observable<any> {
    return this.http.get(`${this.apiUrl}/api/dmarket/items`, { params });
  }
  getUserInventory(gameId: string, title?: string): Observable<any> {
    const params: any = {
      GameID: gameId,
      // A documentação usa 'BasicFilters.Title' para o nome do item
      'BasicFilters.Title': title || ''
    };

    // Remove o filtro de título se estiver vazio, para não enviar um parâmetro em branco
    if (!params['BasicFilters.Title']) {
      delete params['BasicFilters.Title'];
    }

    return this.http.get(`${this.apiUrl}/api/dmarket/inventory`, { params });
  }

}
