import {Injectable, signal} from '@angular/core';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  timeout: number; // ms
  createdAt: number;
}

@Injectable({providedIn: 'root'})
export class ToasterService {
  private readonly _toasts = signal<Toast[]>([]);
  readonly toasts = this._toasts.asReadonly();
  private readonly defaultTimeout = 3000;

  show(message: string, type: ToastType = 'info', timeout: number = this.defaultTimeout) {
    const id = crypto.randomUUID();
    const toast: Toast = {id, type, message, timeout, createdAt: Date.now()};
    this._toasts.update(list => [...list, toast]);
    if (timeout > 0) {
      setTimeout(() => this.dismiss(id), timeout);
    }
    return id;
  }

  success(msg: string, timeout?: number) {
    return this.show(msg, 'success', timeout ?? this.defaultTimeout);
  }

  error(msg: string, timeout?: number) {
    return this.show(msg, 'error', timeout ?? this.defaultTimeout);
  }

  warning(msg: string, timeout?: number) {
    return this.show(msg, 'warning', timeout ?? this.defaultTimeout);
  }

  info(msg: string, timeout?: number) {
    return this.show(msg, 'info', timeout ?? this.defaultTimeout);
  }

  dismiss(id: string) {
    this._toasts.update(list => list.filter(t => t.id !== id));
  }

  clear() {
    this._toasts.set([]);
  }
}

