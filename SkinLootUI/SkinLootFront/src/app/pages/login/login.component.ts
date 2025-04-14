import { Component } from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {BehaviorSubject, catchError, of} from "rxjs";
import {LoginService} from "../../service/login.service";
import {Router} from "@angular/router";
import {AsyncPipe, NgIf} from "@angular/common";

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    AsyncPipe,
    NgIf
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  loginForm: FormGroup;

  isLoading$ = new BehaviorSubject<boolean>(false);
  loginError$ = new BehaviorSubject<string | null>(null);

  constructor(
    private fb: FormBuilder,
    private loginService: LoginService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      senha: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.loginForm.invalid) return;

    this.isLoading$.next(true);
    this.loginError$.next(null);

    const credentials = this.loginForm.value; // já tem email e senha

    this.loginService.login(credentials).pipe(
      catchError(err => {
        this.loginError$.next('Email ou senha inválidos');
        this.isLoading$.next(false);
        return of(null);
      })
    ).subscribe((response) => {
      if (response) {
        this.router.navigate(['/']);
      }
      this.isLoading$.next(false);
    });
  }
}
