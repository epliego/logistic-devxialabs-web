import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../enviroments/environment';

@Injectable({
  providedIn: 'root',
})
export class ValuesCatalogService {
  constructor(private http: HttpClient) {}

  /**
   * Internal user login
   * @param payload
   * @param access_token
   */
  public valuesCatalog(payload: any, access_token: string) {
    return this.http.post(environment.URL_BASE_NESTJS + 'values-catalog/value', payload, {
      headers: new HttpHeaders({
        Authorization: 'Bearer ' + access_token,
      }),
    });
  }
}
