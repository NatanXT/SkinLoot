import { Routes } from '@angular/router';
import {MenuComponent} from "./pages/menu/menu.component";
import {SkinCardComponent} from "./pages/skin/skin-card/skin-card.component";

export const routes: Routes = [
  { path: 'menu', component: MenuComponent },
  { path: 'skins', component: SkinCardComponent },

  { path: '', redirectTo: 'MenuComponent', pathMatch: 'full' },
];
