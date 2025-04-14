import { Routes } from '@angular/router';
import {MenuComponent} from "./pages/menu/menu.component";
import {SkinCardComponent} from "./pages/skin/skin-card/skin-card.component";
import {LoginComponent} from "./pages/login/login.component";

export const routes: Routes = [
  { path: 'menu', component: MenuComponent },
  { path: 'skins', component: SkinCardComponent },
  { path: 'login', component: LoginComponent },


  { path: '', redirectTo: 'MenuComponent', pathMatch: 'full' },
];
