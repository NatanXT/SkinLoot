import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {MenuComponent} from "./pages/menu/menu.component";
import {SkinCardComponent} from "./pages/skin/skin-card/skin-card.component";
import {SkinListComponent} from "./pages/skin/skin-list/skin-list.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [SkinListComponent,RouterOutlet, MenuComponent, SkinCardComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'SkinLootFront';
}
