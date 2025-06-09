import { Component } from '@angular/core';
import {Anuncio} from "../../../../model/anuncio";
import {AnuncioService} from "../../../../service/anuncio.service";
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {SkinService} from "../../../../service/skin.service";
import {Skin, SkinRequest} from "../../../../model/skin";
import {MatFormField, MatFormFieldModule} from '@angular/material/form-field';
import {MatOption, MatSelect, MatSelectModule} from "@angular/material/select";
import {CommonModule, NgForOf, NgIf} from "@angular/common";
import {MatInputModule} from "@angular/material/input";
import {MatButtonModule} from "@angular/material/button";
import {Jogo} from "../../../../model/jogo";
import {JogoService} from "../../../../service/jogo.service";
import {Router} from "@angular/router";

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
  jogos: Jogo[] = [];
  selectedIconFile: File | null = null;
  previewUrl: string | null = null;


  raridade = ['COMUM', 'INCOMUM', 'RARO', 'ÉPICO', 'LENDÁRIO'];
  qualidade = ['NOVA', 'POUCO_USADA', 'TESTADA', 'DESGASTADA', 'BEM_DESGASTADA'];


  constructor(
    private fb: FormBuilder,
    private jogoService: JogoService,
    private skinService: SkinService,
    private router: Router,
  ) {
    this.skinForm = this.fb.group({
      nome: ['', [Validators.required, Validators.minLength(3)]],
      descricao: [''],
      raridade: ['', Validators.required],
      jogoId:    ['', Validators.required],   // ← renomeie de jogoNome para jogoId
      icon: ['', Validators.required],
      assetId: [''],
      desgasteFloat: [null],
      qualidade: ['']
    });
  }

  ngOnInit(): void {
    // carrega todos os jogos para popular o dropdown
    this.jogoService.listarJogos().subscribe(//perguntar pro gpt pq isso ta ai
      jogos => this.jogos = jogos,
      err   => console.error('Erro ao buscar jogos', err)
    );
  }

  onIconSelected(event: Event): void {
    const fileInput = event.target as HTMLInputElement;
    if (fileInput.files && fileInput.files[0]) {
      this.selectedIconFile = fileInput.files[0];

      const reader = new FileReader();
      reader.onload = () => {
        this.previewUrl = reader.result as string;

        // Se você quiser salvar o base64 no form:
        this.skinForm.patchValue({ icon: this.previewUrl });
      };
      reader.readAsDataURL(this.selectedIconFile);
    }
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
        this.skinService.notificarAtualizacao();
        this.router.navigate(['/skins']);
      },
      error: (err) => {
        this.statusMessage = '❌ Erro ao criar skin.';
        console.error('Erro:', err);
      }
    });
  }
}
