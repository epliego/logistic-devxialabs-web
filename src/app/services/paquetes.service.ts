import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class PaquetesService {
  constructor(private http: HttpClient) {}

  /**
   * Obtener los Shipments desde la API
   * @param estado
   * @param offset
   * @param search
   * @param limit
   * @param order
   */
  public obtenerPaquetes(
    estado: string = '',
    offset: string,
    search: string,
    limit: string,
    order: string,
  ) {
    return this.http.get(
      'http://localhost:3000/api/paquetes?estado=' +
        estado +
        '&offset=' +
        offset +
        '&search=' +
        search +
        '&limit=' +
        limit +
        '&order=' +
        order,
    );
  }

  /**
   * Crear un nuevo Paquete
   * @param payload
   */
  public crearPaquete(payload: any) {
    return this.http.post('http://localhost:3000/api/paquetes', payload);
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
   * Obtener datos de un Paquete desde la API
   * @param paquete_id
   */
  public obtenerPaquete(paquete_id: string) {
    return this.http.get('http://localhost:3000/api/paquetes/' + paquete_id);
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
