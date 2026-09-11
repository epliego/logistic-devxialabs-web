import { Component, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { jwtDecode } from 'jwt-decode';
import { AuthUserType } from '../../../types/auth-user.type';

@Component({
  selector: 'sidebar-external-root',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar {
  // protected readonly title = signal('zoom-web');

  public user_profile_name: string = '';

  public async ngOnInit(): Promise<void> {
    if (
      localStorage.getItem('internal_user_token') &&
      localStorage.getItem('internal_user_token') !== ''
    ) {
      const access_token_decoded = jwtDecode<AuthUserType>(
        localStorage.getItem('internal_user_token')!,
      );

      this.user_profile_name = access_token_decoded.user_profile_name;
    }
  }
}
