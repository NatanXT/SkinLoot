import { Component } from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import {NgIf} from "@angular/common";

@Component({
  selector: 'app-registro',
  templateUrl: './registro.component.html',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    NgIf
  ],
  styleUrls: ['./registro.component.css']
})
export class RegistroComponent {
  registroForm: FormGroup;
  isLoading = false;
  errorMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router
  ) {
    this.registroForm = this.fb.group({
      nome: ['', Validators.required],
      genero: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      senha: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit(): void {
    if (this.registroForm.invalid) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;

    const payload = this.registroForm.value;

    this.http.post<any>('http://localhost:8080/usuarios/register', payload)
      .subscribe({
        next: (response) => {
          // Salvando o accessToken recebido
          localStorage.setItem('accessToken', response.accessToken);
          localStorage.setItem('userName', response.nome);

          // Redireciona para home (ou página que quiser)
          this.router.navigate(['/']);
        },
        error: (error) => {
          console.error(error);
          this.errorMessage = error.error?.message || 'Erro ao registrar usuário.';
          this.isLoading = false;
        },
        complete: () => {
          this.isLoading = false;
        }
      });
  }
}
