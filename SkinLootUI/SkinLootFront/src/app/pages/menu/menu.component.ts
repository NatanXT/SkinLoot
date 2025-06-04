import {Component, OnInit} from '@angular/core';
import {Router, RouterLink, RouterModule} from "@angular/router";
import {catchError, Observable, of} from "rxjs";
import {Usuario} from "../../model/usuario";
import {LoginService} from "../../service/login.service";
import {AsyncPipe, NgIf} from "@angular/common";
import {MatDialog, MatDialogModule} from "@angular/material/dialog";
import {RegistroComponent} from "../registro/registro/registro.component";
import {StorageService} from "../../service/storage.service";
import {MatAnchor, MatButton} from "@angular/material/button";
import {MatToolbar} from "@angular/material/toolbar";
import {MatIcon} from "@angular/material/icon";
import {MatFormField, MatLabel} from "@angular/material/form-field";
import {MatInput} from "@angular/material/input";


@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [
    RouterLink,
    RouterModule,
    AsyncPipe,
    NgIf,
    MatDialogModule,
    MatButton,
    MatToolbar,
    MatIcon,
    MatAnchor,
    MatFormField,
    MatInput,
    MatLabel
  ],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.css'
})
export class MenuComponent implements OnInit{

  currentUser$: Observable<Usuario | null>;

  constructor(private loginService: LoginService, private dialog: MatDialog, private router: Router) {
    this.currentUser$ = this.loginService.currentUser$;
  }

  ngOnInit(): void {
    this.currentUser$ = this.loginService.getCurrentUser().pipe(
      // Se der erro (não logado), retorna null.
      catchError(() => of(null))
    );
  }

  abrirRegistro() {
    this.dialog.open(RegistroComponent, {
      width: '450px',
      disableClose: true
    });
  }
  logout(): void {
    this.loginService.logout().subscribe({
      next: () => {
        // Redireciona para login
        this.router.navigate(['/']);
      },
      error: err => {
        console.error('Erro ao fazer logout:', err);
      }
    });
  }
}

