import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {Skin, SkinRequest} from "../model/skin";

@Injectable({
  providedIn: 'root'
})
export class SkinService {

  private apiUrl: string = 'http://localhost:8080/skins';

  constructor(private http: HttpClient) { }

  salvar(skin: SkinRequest): Observable<any>{
    return this.http.post(`${this.apiUrl}/save`, skin);
  }
}
