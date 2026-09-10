import { Routes } from '@angular/router';
import { Login } from './pages/internal_user/login/login';
import { AuthLayout } from './pages/internal_user/auth_layout/auth-layout';
import { Internal } from './pages/internal/internal';
import { routes as internalRoutes } from './pages/internal/internal.routes';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'internal_user',
    pathMatch: 'full',
  },
  {
    path: 'internal_user',
    component: AuthLayout,
    children: [
      {
        path: '',
        component: Login,
      },
    ],
  },
  {
    path: 'internal',
    component: Internal,
    children: internalRoutes,
  },
  {
    path: '**',
    redirectTo: 'internal_user',
  },
];
