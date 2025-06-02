import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Anuncio, AnuncioRequest} from "../model/anuncio";
import {Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class AnuncioService {
  private baseUrl = 'http://localhost:8080/anuncios';

  constructor(private http: HttpClient) {
  }

  criarAnuncio(anuncio: AnuncioRequest): Observable<any> {
    return this.http.post(`${this.baseUrl}/save`, anuncio);
  }

  listarAnuncios(): Observable<Anuncio[]> {
    return this.http.get<Anuncio[]>(this.baseUrl);
  }
}
