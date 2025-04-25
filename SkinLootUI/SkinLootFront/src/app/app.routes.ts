import { Routes } from '@angular/router';
import {MenuComponent} from "./pages/menu/menu.component";
import {SkinCardComponent} from "./pages/skin/skin-card/skin-card.component";
import {LoginComponent} from "./pages/login/login.component";

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: '',
    loadComponent: () => import('./pages/menu/menu.component').then(m => m.MenuComponent),
    pathMatch: 'full'
  },


  { path: '', redirectTo: 'MenuComponent', pathMatch: 'full' },
];
