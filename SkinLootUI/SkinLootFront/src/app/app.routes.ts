import { Routes } from '@angular/router';
import {MenuComponent} from "./pages/menu/menu.component";
import {SkinCardComponent} from "./pages/skin/skin-card/skin-card.component";
import {LoginComponent} from "./pages/login/login.component";
import {AuthGuard} from "./service/auth.guard";

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/public/anuncio-list.component').then(m => m.AnuncioListComponent),
    pathMatch: 'full'
  },
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
      .then(m => m.SkinListComponent)

  },
  {
    path: 'meus-anuncios/criar/:itemId',
    loadComponent: () => import('./pages/meus-anuncios/criar-anuncio/criar-anuncio.component').then(m => m.CriarAnuncioComponent),
  },
  {
    path: 'anuncios/:id',
    loadComponent: () => import('./pages/public/anuncio-detalhes/anuncio-detalhes.component').then(m => m.AnuncioDetalhesComponent)
  },
  {
    path: 'dmarket/connect',
    loadComponent: () =>
      import('./pages/dmarket-connect/dmarket-connect.component').then(m => m.DmarketConnectComponent),
  },
  {
    path: 'dmarket/marketplace',
    loadComponent: () => import('./pages/public/dmarket-items/dmarket-items.component').then(m => m.DmarketItemsComponent),
  },









  // { path: '', redirectTo: '', pathMatch: 'full' },
];
