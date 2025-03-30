import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Anuncio} from "../model/anuncio";
import {Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class AnuncioService {
  private baseUrl = 'http://localhost:8080/api/anuncios';

  constructor(private http: HttpClient) {
  }

  listarAnuncios(): Observable<Anuncio[]> {
    return this.http.get<Anuncio[]>(this.baseUrl);
  }

  criarAnuncio(anuncio: Anuncio): Observable<Anuncio> {
    return this.http.post<Anuncio>(this.baseUrl, anuncio);
  }
}
