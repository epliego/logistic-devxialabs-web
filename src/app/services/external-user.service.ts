import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../enviroments/environment';

@Injectable({
  providedIn: 'root',
})
export class ExternalUserService {
  constructor(private http: HttpClient) {}

  /**
   * Shipments Tracking History List
   * @param tracking_code
   * @param offset
   * @param search
   * @param limit
   * @param order
   * @param access_token
   */
  public trackingHistoryShipment(
    tracking_code: string = '',
    offset: string,
    search: string,
    limit: string,
    order: string,
    access_token: string,
  ) {
    return this.http.get(
      environment.URL_BASE_NESTJS +
        'external-user/tracking/' +
        tracking_code +
        '?offset=' +
        offset +
        '&search=' +
        search +
        '&limit=' +
        limit +
        '&order=' +
        order,
    );
  }
}
