import { Component, OnInit } from '@angular/core';
import { ChatService, ChatMessage } from '../../services/chat.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit {

  destinatarioId: number = 2; // Substitua depois com valor dinâmico (ex: ao clicar num usuário)
  novaMensagem: string = '';
  mensagens: ChatMessage[] = [];

  constructor(private chatService: ChatService) {}

  ngOnInit(): void {
    // Inicializa com destinatário definido
    this.carregarMensagens();
  }

  carregarMensagens(): void {
    if (this.destinatarioId > 0) {
      this.chatService.buscarConversas(this.destinatarioId).subscribe({
        next: (res) => this.mensagens = res,
        error: (err) => console.error('Erro ao carregar mensagens', err)
      });
    }
  }

  enviar(): void {
    if (this.novaMensagem.trim()) {
      this.chatService.enviarMensagem(this.destinatarioId, this.novaMensagem).subscribe({
        next: () => {
          this.novaMensagem = '';
          this.carregarMensagens(); // Recarrega após envio
        },
        error: (err) => console.error('Erro ao enviar mensagem', err)
      });
    }
  }
}
