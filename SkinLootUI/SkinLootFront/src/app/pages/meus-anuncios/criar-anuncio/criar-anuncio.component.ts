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
  skinId!: string;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private anuncioService: AnuncioService
  ) { }

  ngOnInit(): void {
    this.skinId = this.route.snapshot.paramMap.get('skinId')!;

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

    const anuncioData = {
      ...this.anuncioForm.value,
      skinId: this.skinId
    };

    this.anuncioService.criarAnuncio(anuncioData).subscribe({
      next: () => {
        alert('Anúncio criado com sucesso!');
        this.router.navigate(['/skins']);
      },
      error: err => {
        console.error('Erro ao criar anúncio:', err);
        alert('Erro ao criar anúncio.');
      }
    });
  }
}
