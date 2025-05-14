import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {Usuario} from "../model/usuario";

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {

  constructor(private http: HttpClient) { }

  getPerfil(): Observable<Usuario>{
    return this.http.get<Usuario>('http://localhost:8080/usuarios/{id}');
  }
}
