import {Component, computed, inject, OnInit, signal} from '@angular/core';
import {Router} from '@angular/router';
import {DataService} from '../../services/data.service';
import {ToasterService} from '../../services/toaster.service';
import {lastValueFrom} from 'rxjs';
import {IUser} from '../../../core/entities/IUser';
import {IHabit} from '../../../core/entities/IHabit';
import {HabitCardComponent} from '../../components/habit-card/habit-card.component';
import {CalendarComponent} from '../../components/calendar/calendar.component';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  templateUrl: './dashboard.page.html',
  imports: [
    HabitCardComponent,
    CalendarComponent
  ],
  styleUrl: './dashboard.page.css'
})
export class DashboardPageComponent implements OnInit {
  loadingUser = signal(true);
  loadingHabits = signal(true);
  user = signal<IUser | null>(null);
  habits = signal<IHabit[]>([]);
  private data = inject(DataService);
  private toaster = inject(ToasterService);
  private router = inject(Router);

  private readonly maxHabitCards = 6; // incluye el reemplazo por "ver más" cuando excede
  showViewMoreFlag = computed(() => this.habits().length > this.maxHabitCards);
  visibleHabits = computed(() => {
    const allHabits = this.habits();
    if (allHabits.length > this.maxHabitCards) {
      // mostramos primeros 5 y el sexto será el botón de ver más
      return allHabits.slice(0, this.maxHabitCards - 1);
    }
    return allHabits;
  });

  async ngOnInit() {
    await this.loadUser();
    await this.loadHabits();
  }

  async logout() {
    await lastValueFrom(this.data.getAll<any>('googleAuth/logout'));
    this.toaster.info('Sesión cerrada');
    // Redirige (usamos location para asegurar limpieza de estado en memoria si aplica)
    window.location.href = '/login';
  }

  onCreateHabit() {
    this.toaster.info('Funcionalidad próximamente');
  }

  goToCreateHabit() {
    window.location.href = '/habit';
  }

  onViewMore() {
    this.router.navigate(['/habit-list']);
  }

  private async loadUser() {
    try {
      const res = await lastValueFrom(this.data.getAll<IUser>('user'));
      // API indicated returns a single IUser; handle both array/object
      const user = Array.isArray(res) ? (res[0] ?? null) : (res as any as IUser);
      if (user) {
        this.user.set(user);
      }
    } finally {
      this.loadingUser.set(false);
    }
  }

  private async loadHabits() {
    try {
      const res = await lastValueFrom(this.data.getAll<IHabit>('habit'));
      this.habits.set(res || []);
    } finally {
      this.loadingHabits.set(false);
    }
  }
}
