import { Injectable } from '@angular/core';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(private storage: StorageService) {}

  getToken(): string | null {
    return this.storage.get('token');
  }

  setToken(token: string): void {
    this.storage.set('token', token);
  }

  clearAuthData(): void {
    this.storage.remove('token');
  }
} 