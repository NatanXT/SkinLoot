import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {DMarketKeyRequest} from "../model/DMarketKeyRequest";
import {Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class DmarketService {
  constructor(private http: HttpClient) {}

  conectarChaves(dados: DMarketKeyRequest): Observable<any> {
    return this.http.post('/api/dmarket/connect', dados);
  }

  listarItensMarketplace(params: any): Observable<any> {
    return this.http.get('/api/dmarket/market/items', { params });
  }
}
