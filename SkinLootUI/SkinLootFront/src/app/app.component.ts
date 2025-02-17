import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {MenuComponent} from "./pages/menu/menu.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, MenuComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'SkinLootFront';
}
