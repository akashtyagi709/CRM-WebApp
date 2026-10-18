
import { Routes } from '@angular/router';

import { Login } from './Components/login/login';
import { Homepage } from './Components/homepage/homepage';
import { authGuard } from './Guards/auth-guard';

export const routes: Routes = [
  // Public routes — no authentication required
  {
    path: '',
    component: Homepage,
  },
  {
    path: 'login',
    component: Login,
  },

  // Protected routes — authentication required
  {
    path: 'dashboard',
    canActivate: [authGuard],
    canActivateChild: [authGuard],
    loadComponent: () =>
      import('./Components/dashbaord/dashbaord').then(
        (component) => component.Dashbaord
      ),
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'overview',
      },
      {
        path: 'overview',
        loadComponent: () =>
          import('./Components/overview/overview').then(
            (component) => component.Overview
          ),
      },
      {
        path: 'leads',
        loadComponent: () =>
          import('./Components/leadsdata/leadsdata').then(
            (component) => component.Leadsdata
          ),
      },
    ],
  },

  // Unknown routes
  {
    path: '**',
    redirectTo: '',
  },
];
