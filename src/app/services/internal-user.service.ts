import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../enviroments/environment';

@Injectable({
  providedIn: 'root',
})
export class InternalUserService {
  constructor(private http: HttpClient) {}

  /**
   * Internal user login
   * @param payload
   */
  public internalUserLogin(payload: any) {
    return this.http.post(environment.URL_BASE_NESTJS + 'internal-user/auth/login', payload);
  }
}
