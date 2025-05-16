import { Component } from '@angular/core';
import {Anuncio} from "../../../../model/anuncio";
import {AnuncioService} from "../../../../service/anuncio.service";
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {SkinService} from "../../../../service/skin.service";
import {SkinRequest} from "../../../../model/skin";
import {MatFormField, MatFormFieldModule} from '@angular/material/form-field';
import {MatOption, MatSelect, MatSelectModule} from "@angular/material/select";
import {CommonModule, NgForOf, NgIf} from "@angular/common";
import {MatInputModule} from "@angular/material/input";
import {MatButtonModule} from "@angular/material/button";

@Component({
  selector: 'app-criar-skin',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    NgForOf,
    NgIf
  ],
  templateUrl: './criar-skin.component.html',
  styleUrl: './criar-skin.component.css'
})
export class CriarSkinComponent {

  skinForm: FormGroup;
  statusMessage: string | null = null;

  raridade = ['COMUM', 'INCOMUM', 'RARO', 'ÉPICO', 'LENDÁRIO'];
  qualidade = ['NOVA', 'POUCO_USADA', 'TESTADA', 'DESGASTADA', 'BEM_DESGASTADA'];

  constructor(
    private fb: FormBuilder,
    private skinService: SkinService
  ) {
    this.skinForm = this.fb.group({
      nome: ['', [Validators.required, Validators.minLength(3)]],
      descricao: [''],
      raridade: ['', Validators.required],
      jogoNome: ['', Validators.required],
      icon: ['', Validators.required],
      assetId: [''],
      floatValue: [null],
      qualidade: ['']
    });
  }

  criarSkin(): void {
    if (this.skinForm.invalid) {
      this.statusMessage = 'Preencha todos os campos obrigatórios.';
      return;
    }

    const request: SkinRequest = this.skinForm.value;

    this.skinService.salvar(request).subscribe({
      next: (res) => {
        this.statusMessage = '✅ Skin criada com sucesso!';
        this.skinForm.reset();
      },
      error: (err) => {
        this.statusMessage = '❌ Erro ao criar skin.';
        console.error('Erro:', err);
      }
    });
  }
}
