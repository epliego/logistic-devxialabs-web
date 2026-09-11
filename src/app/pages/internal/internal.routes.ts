import { Routes } from '@angular/router';
import { Shipments } from './shipments/shipments';
import { ViewShipment } from './view_shipment/view-shipment';
import { AddUser } from './add_user/add-user';

export const routes: Routes = [
  {
    path: 'shipments',
    component: Shipments,
  },
  {
    path: 'view_shipment/:id',
    component: ViewShipment,
  },
  {
    path: 'add_user',
    component: AddUser,
  },
];
