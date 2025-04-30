import {Component, OnInit} from '@angular/core';
import {RouterLink, RouterModule} from "@angular/router";
import {Observable} from "rxjs";
import {Usuario} from "../../model/usuario";
import {LoginService} from "../../service/login.service";
import {AsyncPipe, NgIf} from "@angular/common";
import {MatDialog, MatDialogModule} from "@angular/material/dialog";
import {RegistroComponent} from "../registro/registro/registro.component";


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
//resolver o erro de unauthroized register
  abrirRegistro() {
    this.dialog.open(RegistroComponent, {
      width: '450px',
      disableClose: true
    });
  }

  ngOnInit(): void {}
}
