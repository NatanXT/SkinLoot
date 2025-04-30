import { Component } from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import {NgIf} from "@angular/common";
import {StorageService} from "../../../service/storage.service";
import {MatDialogModule, MatDialogRef} from "@angular/material/dialog";
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import {MatFormField} from "@angular/material/form-field";
import {RegistroService} from "../../../service/registro.service";

@Component({
  selector: 'app-registro',
  templateUrl: './registro.component.html',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    NgIf,
    MatDialogModule,
    MatFormField,
    MatFormFieldModule,
    MatInputModule
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
    private dialogRef: MatDialogRef<RegistroComponent>,
    private storageService: StorageService,
    private registroService: RegistroService
  ) {
    this.registroForm = this.fb.group({
      nome: ['', Validators.required],
      genero: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      senha: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit(): void {
    if (this.registroForm.invalid) return;

    this.isLoading = true;
    const payload = this.registroForm.value;

    this.registroService.registrar(payload).subscribe({
      next: res => {
        console.log('Resposta do backend:', res);

        this.storageService.set('accessToken', res.accessToken);
        this.storageService.set('userName', String(res.user.nome));
        this.dialogRef?.close();
      },
      error: err => {
        this.errorMessage = err.ERROR?.message || 'erro ao regisrar.';
        this.isLoading = false;
      }
    });
  }
}
