import { Routes } from '@angular/router';
import { Shipments } from './shipments/shipments';
import { ViewShipment } from './view_shipment/view-shipment';

export const routes: Routes = [
  {
    path: 'shipments',
    component: Shipments,
  },
  {
    path: 'view_shipment/:id',
    component: ViewShipment,
  },
];
