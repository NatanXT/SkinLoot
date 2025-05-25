import { Injectable } from '@angular/core';
import {CanActivate, Router, UrlTree} from '@angular/router';
import {map, Observable} from "rxjs";
import {LoginService} from "./login.service";  // ajuste o caminho conforme o local do AuthService

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private loginService: LoginService, private router: Router) {}

  canActivate(): Observable<boolean | UrlTree> {
    return this.loginService.isLoggedIn().pipe(
      map(isLoggedIn => {
        if (isLoggedIn) {
          return true;
        } else {
          return this.router.parseUrl('/login');
        }
      })
    );
  }
}

