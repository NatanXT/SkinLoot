import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {MatFormField, MatLabel} from "@angular/material/form-field";
import {ActivatedRoute, Router} from "@angular/router";
import {MatOption, MatSelect} from "@angular/material/select";
import {AnuncioService} from "../../../service/anuncio.service";
import {MatInput} from "@angular/material/input";
import {MatButton} from "@angular/material/button";
import {AnuncioRequest} from "../../../model/anuncio";

@Component({
  selector: 'app-criar-anuncio',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatLabel,
    MatFormField,
    MatSelect,
    MatOption,
    MatInput,
    MatButton
  ],
  templateUrl: './criar-anuncio.component.html',
  styleUrl: './criar-anuncio.component.css'
})

export class CriarAnuncioComponent implements OnInit {
  anuncioForm!: FormGroup;

  // Vamos usar o nome correto para a variável, para manter a clareza.
  itemId!: string;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private anuncioService: AnuncioService
  ) { }

  ngOnInit(): void {
    // --- CORREÇÃO AQUI ---
    // Leia o parâmetro com o nome correto que está vindo da rota: 'itemId'
    const idFromRoute = this.route.snapshot.paramMap.get('itemId');

    if (idFromRoute) {
      this.itemId = idFromRoute;
    } else {
      // Se nenhum ID for encontrado, é um erro.
      console.error("Nenhum itemId encontrado na rota! Redirecionando...");
      this.router.navigate(['/']); // Ex: volta para a home
      return;
    }

    this.anuncioForm = this.fb.group({
      titulo: ['', [Validators.required, Validators.minLength(3)]],
      descricao: ['', [Validators.required]],
      preco: [null, [Validators.required, Validators.min(0.01)]],
      status: ['ATIVO']
    });
  }

  criarAnuncio(): void {
    // 1. Força o Angular a atualizar os valores e o status de validação do formulário
    this.anuncioForm.updateValueAndValidity();

    // 2. Checa a validade APÓS a atualização
    if (this.anuncioForm.invalid) {
      console.error('Formulário inválido. Verifique os campos.');
      // Esta linha ajuda a exibir as mensagens de erro nos campos, se você as tiver
      this.anuncioForm.markAllAsTouched();
      return;
    }

    // 3. Pega os dados limpos e atualizados do formulário
    const anuncioData: AnuncioRequest = this.anuncioForm.value;

    // 4. Chama o serviço com os parâmetros corretos
    this.anuncioService.criarAnuncio(this.itemId, anuncioData).subscribe({
      next: () => {
        alert('Anúncio criado com sucesso!');
        this.router.navigate(['/']); // Ou para a página de "meus anúncios"
      },
      error: err => {
        console.error('Erro ao criar anúncio:', err);
        alert('Erro ao criar anúncio.');
      }
    });
  }
}
