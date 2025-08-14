import {inject, Injectable} from '@angular/core';
import {CanActivate, Router, UrlTree} from '@angular/router';
import {DataService} from './data.service';
import {lastValueFrom} from 'rxjs';

@Injectable({providedIn: 'root'})
export class AuthGuard implements CanActivate {
  private router = inject(Router);
  private dataService = inject(DataService);

  async canActivate(): Promise<boolean | UrlTree> {
    try {
      await lastValueFrom(this.dataService.ping());
      return true; // 200 -> autenticado
    } catch (error: any) {
      if (error?.status === 401) {
        return this.router.createUrlTree(['/login']);
      }
      return this.router.createUrlTree(['/login']);
    }
  }
}
