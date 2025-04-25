import {Component, OnInit} from '@angular/core';
import {RouterLink, RouterModule} from "@angular/router";
import {Observable} from "rxjs";
import {Usuario} from "../../model/usuario";
import {LoginService} from "../../service/login.service";
import {AsyncPipe, NgIf} from "@angular/common";


@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [
    RouterLink,
    RouterModule,
    AsyncPipe,
    NgIf
  ],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.css'
})
export class MenuComponent implements OnInit {
  currentUser$: Observable<Usuario | null>;

  constructor(private loginService: LoginService) {
    this.currentUser$ = this.loginService.currentUser$;
  }

  ngOnInit(): void {}
}
