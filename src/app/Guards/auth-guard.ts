import { CanActivateFn } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {
  if (!sessionStorage.getItem('token')) {
    window.location.href = '/login';
    return false;
  }
  return true;
};
