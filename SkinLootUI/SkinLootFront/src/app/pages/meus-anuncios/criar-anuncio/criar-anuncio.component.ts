import { Component, type OnInit } from "@angular/core"
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms"
import { MatFormField, MatLabel, MatError, MatPrefix, MatSuffix } from "@angular/material/form-field"
import { ActivatedRoute, Router } from "@angular/router"
import { MatOption, MatSelect } from "@angular/material/select"
import { AnuncioService } from "../../../service/anuncio.service"
import { MatInput } from "@angular/material/input"
import { MatButton } from "@angular/material/button"
import { MatIcon } from "@angular/material/icon"
import { NgIf } from "@angular/common"

@Component({
  selector: "app-criar-anuncio",
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatLabel,
    MatFormField,
    MatSelect,
    MatOption,
    MatInput,
    MatButton,
    MatIcon,
    MatError,
    MatPrefix,
    MatSuffix,
    NgIf,
  ],
  templateUrl: "./criar-anuncio.component.html",
  styleUrl: "./criar-anuncio.component.css",
})
export class CriarAnuncioComponent implements OnInit {
  anuncioForm!: FormGroup
  itemId!: string
  loading = false

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private anuncioService: AnuncioService,
  ) {}

  ngOnInit(): void {
    // Lê o parâmetro da rota
    const idFromRoute = this.route.snapshot.paramMap.get("itemId")

    if (idFromRoute) {
      this.itemId = idFromRoute
    } else {
      console.error("Nenhum itemId encontrado na rota! Redirecionando...")
      this.router.navigate(["/"])
      return
    }

    // Inicializa o formulário com validações
    this.anuncioForm = this.fb.group({
      titulo: ["", [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      descricao: ["", [Validators.required, Validators.minLength(10), Validators.maxLength(500)]],
      preco: [null, [Validators.required, Validators.min(0.01), Validators.max(999999)]],
      status: ["ATIVO", [Validators.required]],
    })
  }

  criarAnuncio(): void {
    if (this.anuncioForm.invalid) {
      this.anuncioForm.markAllAsTouched()
      return
    }

    this.loading = true
    const anuncioData = this.anuncioForm.value

    this.anuncioService.criarAnuncio(this.itemId, anuncioData).subscribe({
      next: () => {
        this.loading = false
        // Aqui você pode usar um snackbar ou toast em vez de alert
        alert("Anúncio criado com sucesso!")
        this.router.navigate(["/meus-anuncios"])
      },
      error: (err) => {
        this.loading = false
        console.error("Erro ao criar anúncio:", err)
        alert("Erro ao criar anúncio. Tente novamente.")
      },
    })
  }

  cancelar(): void {
    if (this.anuncioForm.dirty) {
      const confirmacao = confirm("Tem certeza que deseja cancelar? As alterações serão perdidas.")
      if (!confirmacao) {
        return
      }
    }
    this.router.navigate(["/"])
  }
}
