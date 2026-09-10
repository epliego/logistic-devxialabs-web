import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Footer } from '../../../partials/footer/footer';

@Component({
  selector: 'autenticacion-layout-root',
  imports: [RouterOutlet, Footer],
  templateUrl: './auth-layout.html',
  styleUrl: './auth-layout.css',
})
export class AuthLayout {
  protected readonly title = signal('Internal Usuario');
}
