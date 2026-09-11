import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Sidebar } from '../../partials/external/sidebar/sidebar';
import { Topbar } from '../../partials/external/topbar/topbar';
import { Footer } from '../../partials/external/footer/footer';

@Component({
  selector: 'external-user-root',
  imports: [RouterOutlet, Topbar, Sidebar, Footer],
  templateUrl: './external-user.html',
  styleUrl: './external-user.css',
})
export class ExternalUser {
  protected readonly title = signal('External User');
}
