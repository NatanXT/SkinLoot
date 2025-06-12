import { Component } from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {HttpClient} from "@angular/common/http";
import {Router} from "@angular/router";
import {NgIf} from "@angular/common";
import {DmarketService} from "../../service/dmarket.service";

@Component({
  selector: 'app-dmarket-connect',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    NgIf
  ],
  templateUrl: './dmarket-connect.component.html',
  styleUrl: './dmarket-connect.component.css'
})
export class DmarketConnectComponent {
  form: FormGroup;
  loading = false;
  success = false;
  error = '';

  constructor(
    private fb: FormBuilder,
    private dmarketService: DmarketService,
    private router: Router
  ) {
    this.form = this.fb.group({
      publicKey: ['', [Validators.required, Validators.minLength(64)]],
      secretKey: ['', [Validators.required, Validators.minLength(128)]]
    });
  }

  submit() {
    if (this.form.invalid) return;

    this.loading = true;
    this.dmarketService.conectarChaves(this.form.value).subscribe({
      next: () => {
        this.success = true;
        this.router.navigate(['/']);
      },
      error: err => {
        this.error = err.error?.message || 'Erro ao conectar com DMarket';
        this.loading = false;
      }
    });
  }

}
