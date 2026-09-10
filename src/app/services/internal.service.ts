import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../enviroments/environment';

@Injectable({
  providedIn: 'root',
})
export class InternalService {
  constructor(private http: HttpClient) {}

  /**
   * Shipments List
   * @param status_id
   * @param offset
   * @param search
   * @param limit
   * @param order
   * @param access_token
   */
  public shipmentsList(
    status_id: string = '',
    offset: string,
    search: string,
    limit: string,
    order: string,
    access_token: string,
  ) {
    return this.http.get(
      environment.URL_BASE_NESTJS +
        'internal/shipments?status_id=' +
        status_id +
        '&offset=' +
        offset +
        '&search=' +
        search +
        '&limit=' +
        limit +
        '&order=' +
        order,
      {
        headers: new HttpHeaders({
          Authorization: 'Bearer ' + access_token,
        }),
      },
    );
  }

  /**
   * Create new Shipment
   * @param payload
   * @param access_token
   */
  public createShipment(payload: any, access_token: string) {
    return this.http.post(environment.URL_BASE_NESTJS + 'internal/shipments', payload, {
      headers: new HttpHeaders({
        Authorization: 'Bearer ' + access_token,
      }),
    });
  }

  /**
   * Actualiza Estado del Paquete
   * @param payload
   * @param estado
   */
  public actualizarEstadoPaquete(payload: any, estado: number) {
    return this.http.patch('http://localhost:3000/api/paquetes/' + estado + '/estado', payload);
  }

  /**
   * Get data Shipment
   * @param shipment_id
   * @param access_token
   */
  public getShipment(shipment_id: string, access_token: string) {
    return this.http.get(environment.URL_BASE_NESTJS + 'internal/shipments/' + shipment_id, {
      headers: new HttpHeaders({
        Authorization: 'Bearer ' + access_token,
      }),
    });
  }

  /**
   * Actualiza datos del Paquete
   * @param payload
   * @param id
   */
  public actualizarPaquete(payload: any, id: number) {
    return this.http.put('http://localhost:3000/api/paquetes/' + id, payload);
  }
}
