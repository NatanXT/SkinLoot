import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {LoginResponse, RegisterRequest, Usuario} from "../model/usuario";
import {Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class RegistroService {
  private apiUrl = 'http://localhost:8080/usuarios';

  constructor(private http: HttpClient){ }

  registrar(request: RegisterRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/register`, request);
  }
}
