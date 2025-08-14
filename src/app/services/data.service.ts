import {inject, Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import {IEntity} from '../../core/entities/IEntity';

@Injectable({providedIn: 'root'})
export class DataService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'https://localhost:5001/api';
  private readonly httpBaseOpts = {withCredentials: true} as const;

  getAll<T extends IEntity = IEntity>(resource?: string, params?: Record<string, any>): Observable<T[]> {
    const res = this.sanitize(resource);
    let httpParams = new HttpParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null) httpParams = httpParams.set(k, String(v));
      });
    }
    return this.http.get<T[]>(`${this.baseUrl}/${res}`, {params: httpParams, withCredentials: true});
  }

  getById<T extends IEntity = IEntity>(resource: string | undefined, irn: string): Observable<T> {
    const res = this.sanitize(resource);
    return this.http.get<T>(`${this.baseUrl}/${res}/${irn}`, {withCredentials: true});
  }

  create<T extends IEntity = IEntity>(resource: string | undefined, body: Partial<T> | any): Observable<T> {
    const res = this.sanitize(resource);
    return this.http.post<T>(`${this.baseUrl}/${res}`, body, this.httpBaseOpts);
  }

  update<T extends IEntity = IEntity>(resource: string | undefined, irn: string, body: Partial<T> | any): Observable<T> {
    const res = this.sanitize(resource);
    return this.http.put<T>(`${this.baseUrl}/${res}/${irn}`, body, this.httpBaseOpts);
  }

  delete<T extends IEntity = IEntity>(resource: string | undefined, irn: string): Observable<boolean> {
    const res = this.sanitize(resource);
    return this.http.delete<boolean>(`${this.baseUrl}/${res}/${irn}`, this.httpBaseOpts);
  }

  deleteMany(resource: string | undefined, irns: string[]): Observable<boolean> {
    const res = this.sanitize(resource);
    return this.http.post<boolean>(`${this.baseUrl}/${res}/DeleteMany`, irns, this.httpBaseOpts);
  }

  ping(path: string = 'base/ping') {
    const res = this.sanitize(path);
    return this.http.get(`${this.baseUrl}/${res}`, {responseType: 'text', withCredentials: true});
  }

  private sanitize(resource?: string): string {
    if (!resource) throw new Error('DataService: resource route requerido');
    return resource.replace(/^\/+|\/+$/g, '');
  }

  private buildUrl(route?: string, extra?: string | number): string {
    const routeToUse = route ? (route.startsWith('/') ? route : '/' + route) : '';
    const extraToUse = extra !== undefined && extra !== null ? ('/' + extra) : '';
    return this.baseUrl + routeToUse + extraToUse;
  }
}
