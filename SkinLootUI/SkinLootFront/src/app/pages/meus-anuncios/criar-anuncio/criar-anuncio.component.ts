import { Component } from '@angular/core';
import {ReactiveFormsModule} from "@angular/forms";
import {MatFormField, MatLabel} from "@angular/material/form-field";

@Component({
  selector: 'app-criar-anuncio',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatLabel,
    MatFormField
  ],
  templateUrl: './criar-anuncio.component.html',
  styleUrl: './criar-anuncio.component.css'
})
export class CriarAnuncioComponent {

}
