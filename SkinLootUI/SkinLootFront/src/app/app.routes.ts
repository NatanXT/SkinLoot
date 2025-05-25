import { Routes } from '@angular/router';
import {MenuComponent} from "./pages/menu/menu.component";
import {SkinCardComponent} from "./pages/skin/skin-card/skin-card.component";
import {LoginComponent} from "./pages/login/login.component";
import {AuthGuard} from "./service/auth.guard";

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'registro',
    loadComponent: () => import('./pages/registro/registro/registro.component').then(m => m.RegistroComponent)
  },
  {
    path: 'skins',
    loadComponent: () => import('./pages/skin/skin-list/skin-list.component')
      .then(m => m.SkinListComponent),canActivate: [AuthGuard],
    children: [
      {
        path: 'criar',
        loadComponent: () => import('./pages/skin/skin-list/criar-skin/criar-skin.component')
          .then(m => m.CriarSkinComponent)
      }
    ]
  },
  {
    path: '',
    loadComponent: () => import('./pages/menu/menu.component').then(m => m.MenuComponent),
    pathMatch: 'full'
  },




  { path: '', redirectTo: 'MenuComponent', pathMatch: 'full' },
];
