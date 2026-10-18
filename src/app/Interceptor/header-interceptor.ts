
import { HttpInterceptorFn } from '@angular/common/http';

export const headerInterceptor: HttpInterceptorFn = (req, next) => {
  const isLoginOrHealth =
    req.url.includes('/api/auth/login') ||
    req.url.includes('/actuator/health') ||
    req.url.endsWith('/health');

  const isPublicContact =
    req.url.includes('/api/contact');

  // Public endpoints do not need the JWT header.
  if (isLoginOrHealth || isPublicContact) {
    return next(req);
  }

  const token = sessionStorage.getItem('token');

  if (token) {
    const clonedReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });

    return next(clonedReq);
  }

  return next(req);
};
