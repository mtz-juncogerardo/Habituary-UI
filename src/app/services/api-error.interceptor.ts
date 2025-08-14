import {HttpErrorResponse, HttpInterceptorFn} from '@angular/common/http';
import {inject} from '@angular/core';
import {ToasterService} from './toaster.service';
import {catchError} from 'rxjs/operators';
import {throwError} from 'rxjs';
import {Router} from '@angular/router';

const AUTH_COOKIE = '.AspNetCore.Cookies';

export const apiErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const toaster = inject(ToasterService);
  const router = inject(Router);
  const started = performance.now();
  return next(req).pipe(
    catchError((err: unknown) => {
      if (err instanceof HttpErrorResponse) {
        const elapsed = Math.round(performance.now() - started);
        const resourceMatch = /\/api\/(.*?)(?:\?|$)/.exec(req.url);
        const resource = resourceMatch ? resourceMatch[1] : '';
        const backendMessage = extractMessage(err.error) || 'Error desconocido';
        const hasCookie = document.cookie.split(';').some(c => c.trim().startsWith(AUTH_COOKIE + '='));

        // Omitir manejo si estamos en login, no hay cookie y es 401 (usuario aún no autenticado)
        if (err.status === 401 && router.url.startsWith('/login') && !hasCookie) {
          return throwError(() => err);
        }

        // Manejo específico de 401 (sesión expirada) fuera de login
        if (err.status === 401) {
          document.cookie = `${AUTH_COOKIE}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;
          if (!router.url.startsWith('/login')) {
            toaster.warning('Sesión expirada. Vuelve a iniciar sesión.');
            setTimeout(() => router.navigateByUrl('/login'), 0);
          }
          return throwError(() => err);
        }

        const logPayload = {
          resource,
          method: req.method,
          url: req.url,
          status: err.status,
          message: backendMessage,
          elapsedMs: elapsed
        };
        console.error('[API ERROR]', logPayload);
        const toastMsg = `${resource ? resource + ' - ' : ''}Error ${err.status}: ${backendMessage}`;
        toaster.error(truncate(toastMsg, 260));
      }
      return throwError(() => err);
    })
  );
};

function extractMessage(errorBody: any): string | undefined {
  if (!errorBody) return undefined;
  if (typeof errorBody === 'string') return errorBody;
  if (typeof errorBody === 'object') return errorBody.message || errorBody.error || errorBody.title;
  return undefined;
}

function truncate(text: string, max: number): string {
  return text.length > max ? text.slice(0, max - 1) + '…' : text;
}
