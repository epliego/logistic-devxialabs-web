import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Sidebar } from '../../partials/internal/sidebar/sidebar';
import { Topbar } from '../../partials/internal/topbar/topbar';
import { Footer } from '../../partials/internal/footer/footer';

@Component({
  selector: 'internal-root',
  imports: [RouterOutlet, Topbar, Sidebar, Footer],
  templateUrl: './internal.html',
  styleUrl: './internal.css',
})
export class Internal {
  protected readonly title = signal('Internal');
}
