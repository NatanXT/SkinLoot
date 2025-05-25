import {Component, OnInit} from '@angular/core';
import {RouterLink, RouterModule} from "@angular/router";
import {catchError, Observable, of} from "rxjs";
import {Usuario} from "../../model/usuario";
import {LoginService} from "../../service/login.service";
import {AsyncPipe, NgIf} from "@angular/common";
import {MatDialog, MatDialogModule} from "@angular/material/dialog";
import {RegistroComponent} from "../registro/registro/registro.component";
import {StorageService} from "../../service/storage.service";


@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [
    RouterLink,
    RouterModule,
    AsyncPipe,
    NgIf,
    MatDialogModule
  ],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.css'
})
export class MenuComponent implements OnInit {
  currentUser$: Observable<Usuario | null>;

  constructor(private loginService: LoginService, private dialog: MatDialog) {
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
}

