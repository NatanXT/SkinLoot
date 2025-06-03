import { Component } from '@angular/core';
import {NavigationEnd, Router, RouterModule, RouterOutlet} from '@angular/router';
import {MenuComponent} from "./pages/menu/menu.component";
import {SkinCardComponent} from "./pages/skin/skin-card/skin-card.component";
import {SkinListComponent} from "./pages/skin/skin-list/skin-list.component";
import {filter} from "rxjs";
import {NgIf} from "@angular/common";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ MenuComponent, SkinListComponent, RouterOutlet, SkinCardComponent, RouterModule, NgIf],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  mostrarBanner = false;
  mostrarMenu = true;

  constructor(private router: Router) {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      // Define quais rotas devem exibir o banner
      const url = event.urlAfterRedirects;

      this.mostrarBanner = event.urlAfterRedirects === '/';
      this.mostrarMenu = !(url === '/login' || url === '/register');
    });
  }
}
