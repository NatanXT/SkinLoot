import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Usuario} from "../model/usuario";
import {Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class RegistroService {
  private apiUrl = 'http://localhost:8080/registro';

  constructor(private http: HttpClient){ }

  registro(data: Usuario): Observable<any> {
    return this.http.post<Usuario>(this.apiUrl, data);
  }
}
