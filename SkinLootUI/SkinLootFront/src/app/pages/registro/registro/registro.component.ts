// import { Component } from '@angular/core';
// import {FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
// import {LoginService} from "../../../service/login.service";
// import { Router } from '@angular/router';
// import {NgIf} from "@angular/common";
// import {RegistroService} from "../../../service/registro.service";
//
// @Component({
//   selector: 'app-registro',
//   standalone: true,
//   imports: [
//     ReactiveFormsModule,
//     NgIf,
//   ],
//   templateUrl: './registro.component.html',
//   styleUrl: './registro.component.css'
// })
// export class RegistroComponent {
//   registerForm: FormGroup;
//   mensagem: string = '';
//   carregando: boolean = false;
//
//   constructor(private registroService: RegistroService) {}
//
//   ngOnInit(): void {
//     this.registerForm = new FormGroup({
//       username: new FormControl(null, [Validators.required]),
//       email: new FormControl(null, [Validators.required, Validators.email]),
//       senha: new FormControl(null, [Validators.required, Validators.minLength(6)]),
//       genero: new FormControl(this.generos[0], Validators.required)
//     });
//   }
//
//   onSubmit(): void {
//     if (this.registerForm.invalid) {
//       this.mensagem = 'Preencha todos os campos corretamente.';
//       return;
//     }
//
//     this.carregando = true;
//     this.mensagem = '';
//
//     const { username, email, senha, genero } = this.registerForm.value;
//
//     this.registroService.registro({ nome, genero, email, senha }).subscribe({
//       next: () => {
//         this.mensagem = 'Cadastro realizado com sucesso!';
//         this.registerForm.reset({ genero: this.generos[0] }); // reseta mantendo o valor default
//       },
//       error: err => {
//         console.error(err);
//         this.mensagem = 'Erro ao registrar usuário. Tente novamente.';
//       },
//       complete: () => this.carregando = false
//     });
//   }
// }
