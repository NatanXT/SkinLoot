import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ChatMessage {
  id?: number;
  conteudo: string;
  remetenteNome?: string;
  destinatarioNome?: string;
  timestamp?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private apiUrl = 'http://localhost:8080/api/chat';

  constructor(private http: HttpClient) {}

  enviarMensagem(destinatarioId: number, conteudo: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/enviar`, {
      destinatarioId,
      conteudo
    });
  }

  buscarConversas(destinatarioId: number): Observable<ChatMessage[]> {
    return this.http.get<ChatMessage[]>(`${this.apiUrl}/conversa/${destinatarioId}`);
  }
}
