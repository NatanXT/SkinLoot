import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {BehaviorSubject, Observable} from "rxjs";
import {Skin, SkinRequest} from "../model/skin";

@Injectable({
  providedIn: 'root'
})
export class SkinService {

  private apiUrl: string = 'http://localhost:8080/skins';
  private atualizarListaSubject = new BehaviorSubject<void>(undefined);
  public atualizarLista$ = this.atualizarListaSubject.asObservable();

  public notificarAtualizacao(): void {
    this.atualizarListaSubject.next();
  }

  constructor(private http: HttpClient) { }


  salvar(skin: SkinRequest): Observable<any>{
    return this.http.post(`${this.apiUrl}/save`, skin);
  }

  listar(): Observable<Skin[]>{
    return this.http.get<Skin[]>(`${this.apiUrl}/list`);
  }
}
