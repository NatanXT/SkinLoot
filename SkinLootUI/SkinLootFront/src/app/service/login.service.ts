import {Inject, Injectable, PLATFORM_ID} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {BehaviorSubject, catchError, map, Observable, of, tap} from "rxjs";
import {LoginCredentials, LoginResponse, Usuario} from "../model/usuario";
import {isPlatformBrowser} from "@angular/common";
import {StorageService} from "./storage.service";
import {AuthService} from "./auth.service";

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  private apiUrl = "http://localhost:8080/usuarios";
  private currentUserSubject = new BehaviorSubject<Usuario| null>(null);
  currentUser$ = this.currentUserSubject.asObservable();
  private authStatusUrl = '/auth/status';

  constructor(
    private http: HttpClient,
    private storage: StorageService,
    private auth: AuthService
  ){
    const salvo = this.storage.get('usuario');
    if (salvo) {
      this.currentUserSubject.next(JSON.parse(salvo));
    }
  }

  login(credentials: LoginCredentials): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(
      `${this.apiUrl}/login`,
      credentials,
      { withCredentials: true }
    ).pipe(
      tap(response => {
        if (response.token) {
          this.auth.setToken(response.token);
        }
      })
    );
  }

  refreshToken(): Observable<{token: string}> {
    return this.http.post<{token: string}>(
      `${this.apiUrl}/auth/refresh`,
      {},
      { withCredentials: true }
    ).pipe(
      tap(response => {
        if (response.token) {
          this.auth.setToken(response.token);
        }
      })
    );
  }

  logout(): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/auth/logout`, {}, { withCredentials: true })
      .pipe(
        tap(() => {
          this.auth.clearAuthData();
          this.currentUserSubject.next(null);
        })
      );
  }

  isLoggedIn(): Observable<boolean> {
    return this.http.get<{ authenticated: boolean }>(
      this.apiUrl + this.authStatusUrl,
      { withCredentials: true }
    ).pipe(
      map(response => response.authenticated),
      catchError(() => of(false))
    );
  }

  getCurrentUser(): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.apiUrl}/auth/me`, { withCredentials: true });
  }
}
