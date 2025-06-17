// auth.interceptor.ts
import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse
} from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject, EMPTY, throwError } from 'rxjs';
import { catchError, switchMap, filter, take, finalize } from 'rxjs/operators';

import { AuthService } from './auth.service';
import { LoginService } from './login.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  private refreshTokenSubject = new BehaviorSubject<string|null>(null);

  constructor(
    private auth: AuthService,
    private loginService: LoginService,
    private router: Router
  ) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const isApiRequest = request.url.startsWith('http://localhost:8080');
    const token = this.auth.getToken();
    
    if (isApiRequest && token) {
      request = request.clone({
        setHeaders: { Authorization: `Bearer ${token}` },
        withCredentials: true
      });
    }

    return next.handle(request).pipe(
      catchError(err => {
        if (!(err instanceof HttpErrorResponse)) {
          return throwError(() => err);
        }

        if (err.status === 401 && request.url.endsWith('/auth/refresh')) {
          this.auth.clearAuthData();
          this.router.navigate(['/login']);
          return EMPTY;
        }

        if (err.status === 401) {
          return this.handle401Error(request, next);
        }

        return throwError(() => err);
      })
    );
  }

  private handle401Error(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);

      return this.loginService.refreshToken().pipe(
        switchMap(response => {
          this.refreshTokenSubject.next(response.token);
          const retry = request.clone({
            setHeaders: { Authorization: `Bearer ${response.token}` },
            withCredentials: true
          });
          return next.handle(retry);
        }),
        catchError(_ => {
          this.auth.clearAuthData();
          this.router.navigate(['/login']);
          return EMPTY;
        }),
        finalize(() => {
          this.isRefreshing = false;
        })
      );
    }

    return this.refreshTokenSubject.pipe(
      filter(token => token != null),
      take(1),
      switchMap(token => {
        const retry = request.clone({
          setHeaders: { Authorization: `Bearer ${token}` },
          withCredentials: true
        });
        return next.handle(retry);
      })
    );
  }
}