import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {Jogo} from "../model/jogo";

@Injectable({
  providedIn: 'root'
})
export class JogoService {
  private baseUrl = 'http://localhost:8080/jogos';

  constructor(private http: HttpClient) { }

  /**
   * Busca todos os jogos cadastrados no backend.
   */
  listarJogos(): Observable<Jogo[]> {
    return this.http.get<Jogo[]>(this.baseUrl);
  }

  /**
   * Salva um novo jogo (ou atualiza um existente).
   * @param jogo Objeto Jogo a ser enviado no corpo da requisição.
   */
  save(jogo: Jogo): Observable<Jogo> {
    return this.http.post<Jogo>(this.baseUrl, jogo);
  }
}
