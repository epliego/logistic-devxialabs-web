import { Component, signal, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { jwtDecode } from 'jwt-decode';
import { AuthUserType } from '../../../types/auth-user.type';

@Component({
  selector: 'topbar-root',
  imports: [],
  templateUrl: './topbar.html',
  styleUrl: './topbar.css',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class Topbar {
  // protected readonly title = signal('zoom-web');

  public user_name: string = '';
  public user_profile_name: string = '';

  public async ngOnInit(): Promise<void> {
    if (localStorage.getItem('internal_user_token')) {
      const access_token_decoded = jwtDecode<AuthUserType>(
        localStorage.getItem('internal_user_token')!,
      );

      this.user_name = access_token_decoded.user_name;
      this.user_profile_name = access_token_decoded.user_profile_name;
    }
  }
}
