import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);

  const token = localStorage.getItem('accessToken');
  const user = localStorage.getItem('user');

  if (token && user) {
    return true;
  }

  router.navigate(['/auth']);
  return false;
};