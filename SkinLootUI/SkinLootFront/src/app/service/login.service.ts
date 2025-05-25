import {Inject, Injectable, PLATFORM_ID} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {BehaviorSubject, catchError, map, Observable, of, tap} from "rxjs";
import {LoginCredentials, LoginResponse, Usuario} from "../model/usuario";
import {isPlatformBrowser} from "@angular/common";
import {StorageService} from "./storage.service";


@Injectable({
  providedIn: 'root'
})
export class LoginService {
  private apiUrl = "http://localhost:8080/usuarios";
  private currentUserSubject = new BehaviorSubject<Usuario| null>(null);
  currentUser$ = this.currentUserSubject.asObservable();
  private authStatusUrl = '/auth/status'; // ou outra rota que o backend disponibiliza


  constructor(private http: HttpClient,
              private storage: StorageService){
    const salvo = this.storage.get('usuario');
    if (salvo) {
      this.currentUserSubject.next(JSON.parse(salvo));
    }
  }

  // login.service.ts
  login(credentials: LoginCredentials): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(
      `${this.apiUrl}/login`,
      credentials,
      { withCredentials: true }      // ← diz ao browser para aceitar o Set-Cookie
    ).pipe(
      tap(response => {
        // você pode continuar salvando no storage se quiser, mas
        // não precisa mais para autenticação do backend
      })
    );
  }

  logout(): void {
    this.storage.remove('token');
    this.storage.remove('userAtual');
    this.currentUserSubject.next(null);
  }

  isLoggedIn(): Observable<boolean> {
    return this.http.get<{ authenticated: boolean }>(  this.apiUrl + this.authStatusUrl,
      { withCredentials: true })
      .pipe(
        map(response => response.authenticated),
        catchError(() => of(false))  // Se der erro, considera não autenticado
      );
  }

  // register(user: Usuario): Observable<Usuario> {
  //   this.storage.set('userAtual', JSON.stringify(user));
  //   this.currentUserSubject.next(user);
  //   return new Observable<Usuario>(observer => {
  //     observer.next(user);
  //     observer.complete();
  //   });
  // }


  getToken(): string | null {
    return this.storage.get('token');
  }
  getCurrentUser(): Observable<Usuario> {
    //const url = `${this.apiUrl}/auth/me`;  // Ajuste conforme sua rota
    return this.http.get<Usuario>(`${this.apiUrl}/auth/me`, { withCredentials: true })

  }

}
