import {Inject, Injectable, PLATFORM_ID} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {BehaviorSubject, Observable, tap} from "rxjs";
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


  constructor(private http: HttpClient,
              private storage: StorageService){
    const salvo = this.storage.get('usuario');
    if (salvo) {
      this.currentUserSubject.next(JSON.parse(salvo));
    }
  }

  login(credentials: LoginCredentials): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, credentials)
      .pipe(
        tap(response => {
          console.log('Token recebido:', response.token); // Log do token

          this.storage.set('token', response.token);
          this.storage.set('userAtual', JSON.stringify(response.user));
          this.currentUserSubject.next(response.user);
        })
      );
  }
  logout(): void {
    this.storage.remove('token');
    this.storage.remove('userAtual');
    this.currentUserSubject.next(null);
  }
  register(user: Usuario): Observable<Usuario> {
    this.storage.set('userAtual', JSON.stringify(user));
    this.currentUserSubject.next(user);
    return new Observable<Usuario>(observer => {
      observer.next(user);
      observer.complete();
    });
  }


  getToken(): string | null {
    return this.storage.get('token');
  }

  isLoggedIn(): boolean {
    return this.currentUserSubject.value !== null;
  }

  getCurrentUser(): Usuario | null {
    return this.currentUserSubject.value;
  }
}
