import {Component, inject, OnInit, signal} from '@angular/core';
import {Router, RouterLink, RouterLinkActive} from '@angular/router';
import {DataService} from '../../services/data.service';
import {lastValueFrom} from 'rxjs';
import {IUser} from '../../../core/entities/IUser';

interface MenuItem {
  label: string;
  icon: string; // font awesome class suffix
  route: string;
  exact?: boolean;
}

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.css'
})
export class MenuComponent implements OnInit {
  user = signal<IUser | null>(null);
  loadingUser = signal(true);
  processingLogout = signal(false);
  items: MenuItem[] = [
    {label: 'Dashboard', icon: 'gauge-high', route: '/dashboard', exact: true},
    {label: 'Habit List', icon: 'list-check', route: '/habit-list'},
    {label: 'Perfil', icon: 'user', route: '/profile'}
  ];
  private data = inject(DataService);
  private router = inject(Router);

  async ngOnInit() {
    await this.loadUser();
  }

  async logout() {
    if (this.processingLogout()) return;
    this.processingLogout.set(true);
    try {
      await lastValueFrom(this.data.getAll<any>('googleAuth/logout'));
      window.location.href = '/login';
    } finally {
      this.processingLogout.set(false);
    }
  }

  private async loadUser() {
    try {
      const res = await lastValueFrom(this.data.getAll<IUser>('user'));
      const user = Array.isArray(res) ? (res[0] ?? null) : (res as any as IUser);
      this.user.set(user);
    } finally {
      this.loadingUser.set(false);
    }
  }
}
