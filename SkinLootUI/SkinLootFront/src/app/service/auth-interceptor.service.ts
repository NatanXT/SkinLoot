import { Injectable } from '@angular/core';
import {HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from "@angular/common/http";
import {Observable} from "rxjs";
import {StorageService} from "./storage.service";

@Injectable({
  providedIn: 'root'
})
export class AuthInterceptorService implements HttpInterceptor{

  constructor(private storage:StorageService) { }
  //private storage = inject(StorageService);


  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    // Clone qualquer requisição para incluir withCredentials
    const authReq = req.clone({
      withCredentials: true    // ← garante envio do cookie JWT em todas chamadas
    });
    return next.handle(authReq);
  }
}
