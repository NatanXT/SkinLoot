import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {MatFormField, MatLabel} from "@angular/material/form-field";
import {ActivatedRoute, Router} from "@angular/router";
import {MatOption, MatSelect} from "@angular/material/select";
import {AnuncioService} from "../../../service/anuncio.service";
import {MatInput} from "@angular/material/input";
import {MatButton} from "@angular/material/button";

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
    if (this.anuncioForm.invalid) {
      return;
    }

    const anuncioData = this.anuncioForm.value;

    // Passa o 'this.itemId' (que agora tem o valor correto) para o serviço
    this.anuncioService.criarAnuncio(this.itemId, anuncioData).subscribe({
      next: () => {
        alert('Anúncio criado com sucesso!');
        this.router.navigate(['/']);
      },
      error: err => {
        console.error('Erro ao criar anúncio:', err);
        alert('Erro ao criar anúncio.');
      }
    });
  }
}
