import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpHeaders,
  HttpErrorResponse,
} from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(
    private authService: AuthService,
    private router: Router,
  ) { }

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    // Get the auth token from the service
    const authToken = this.authService.getToken();
    console.log('authToken', authToken);

    // Clone the request and add the authorization header
    if (authToken) {
      const authReq = req.clone({
        headers: req.headers.set('Authorization', `Bearer ${authToken}`),
      });

      // Pass on the cloned request instead of the original request
      return next.handle(authReq).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          // Token is expired or user is unauthorized
          // Clear local storage or token
          localStorage.removeItem(AuthService.TokenKey);
          // Redirect to login page
          this.router.navigate(['/login']);
        }
        return throwError(error);
      })
    );
    }

    // If no token is present, send the request without the Authorization header
    return next.handle(req);
  }
}
