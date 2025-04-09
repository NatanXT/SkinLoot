import { Component } from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {LoginService} from "../../../service/login.service";
import { Router } from '@angular/router';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [
    ReactiveFormsModule,
  ],
  templateUrl: './registro.component.html',
  styleUrl: './registro.component.css'
})
export class RegistroComponent {
  registroForm: FormGroup;

  constructor(private fb: FormBuilder, private authService: LoginService, private router: Router) {
    this.registroForm = this.fb.group({
      nome: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      senha: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.registroForm.valid) {
      const novoUsuario = this.registroForm.value;
      // Chame o método de registro do AuthService (integre com seu backend se necessário)
      this.authService.register(novoUsuario).subscribe({
        next: (usuario) => {
          // Após o registro, redirecione para a página de perfil ou home
          this.router.navigate(['/home']);
        },
        error: (err) => {
          console.error('Erro ao registrar usuário:', err);
        }
      });
    }
  }
}
