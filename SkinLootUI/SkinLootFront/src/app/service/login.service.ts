import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {BehaviorSubject, Observable, tap} from "rxjs";
import {LoginCredentials, LoginResponse, Usuario} from "../model/usuario";

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  private apiUrl = "http://localhost:8080/login";
  private currentUserSubject = new BehaviorSubject<Usuario| null>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    const salvo = localStorage.getItem("salvo");
    if (salvo) {
      this.currentUserSubject.next(JSON.parse(salvo))
    }
  }

  login(credentials: LoginCredentials): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, credentials)
      .pipe(
        tap(response => {
          localStorage.setItem('token', response.token);
          localStorage.setItem('userAtual', JSON.stringify(response.user));
          this.currentUserSubject.next(response.user);
        })
      );
  }
  logout(): void {
    // Limpa o localStorage e o BehaviorSubject
    localStorage.removeItem('token');
    localStorage.removeItem('userAtual');
    this.currentUserSubject.next(null);
  }
  register(user: Usuario): Observable<Usuario> {
    // Aqui você chamaria a API de cadastro.
    // Por enquanto, vamos simular retornando o mesmo usuário:
    this.currentUserSubject.next(usuario);
    return new Observable<Usuario>(observer => {
      observer.next(usuario);
      observer.complete();
    });
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isLoggedIn(): boolean {
    return this.currentUserSubject.value !== null;
  }

  getCurrentUser(): Usuario| null {
    return this.currentUserSubject.value;
  }
}
