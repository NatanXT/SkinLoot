import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class SteamService {

  private apiUrl = 'http://localhost:8080/api/steam'; // URL base para o seu controller da Steam

  constructor(private http: HttpClient) { }

  // Método que chama o endpoint do seu backend para buscar o inventário enriquecido
  getInventory(steamId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/inventory/${steamId}`);
  }
}

