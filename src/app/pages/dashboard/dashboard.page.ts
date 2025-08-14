import {Component, computed, inject, OnInit, signal} from '@angular/core';
import {DataService} from '../../services/data.service';
import {ToasterService} from '../../services/toaster.service';
import {lastValueFrom} from 'rxjs';
import {IUser} from '../../../core/entities/IUser';
import {IHabit} from '../../../core/entities/IHabit';
import {DatePipe} from '@angular/common';

interface CalendarDay {
  date: Date;
  inMonth: boolean;
  habits: IHabit[];
}

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  templateUrl: './dashboard.page.html',
  imports: [
    DatePipe
  ],
  styleUrl: './dashboard.page.css'
})
export class DashboardPageComponent implements OnInit {
  loadingUser = signal(true);
  loadingHabits = signal(true);
  user = signal<IUser | null>(null);
  habits = signal<IHabit[]>([]);
  month = signal<Date>(new Date());
  readonly daysOfWeek = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  calendar = computed<CalendarDay[]>(() => this.buildCalendar(this.month(), this.habits()));
  private data = inject(DataService);
  private toaster = inject(ToasterService);

  async ngOnInit() {
    await this.loadUser();
    await this.loadHabits();
  }

  async logout() {
    await lastValueFrom(this.data.getAll<any>('googleAuth/logout'));
    this.toaster.info('Sesión cerrada');
    await Promise.resolve(this.toaster); // no-op para mantener async
    // Redirige (usamos location para asegurar limpieza de estado en memoria si aplica)
    window.location.href = '/login';
  }

  prevMonth() {
    this.shiftMonth(-1);
  }

  nextMonth() {
    this.shiftMonth(1);
  }

  today() {
    this.month.set(new Date());
  }

  isToday(d: Date): boolean {
    const t = new Date();
    return d.getFullYear() === t.getFullYear() && d.getMonth() === t.getMonth() && d.getDate() === t.getDate();
  }

  onCreateHabit() {
    this.toaster.info('Funcionalidad próximamente');
  }

  private async loadUser() {
    try {
      const res = await lastValueFrom(this.data.getAll<IUser>('user'));
      // API indicated returns a single IUser; handle both array/object
      const user = Array.isArray(res) ? (res[0] ?? null) : (res as any as IUser);
      if (user) {
        this.user.set(user);
        this.toaster.success('Bienvenido de nuevo');
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

  private shiftMonth(delta: number) {
    const d = this.month();
    this.month.set(new Date(d.getFullYear(), d.getMonth() + delta, 1));
  }

  private buildCalendar(current: Date, habits: IHabit[]): CalendarDay[] {
    const year = current.getFullYear();
    const month = current.getMonth();
    const firstDay = new Date(year, month, 1);
    const startWeekDay = firstDay.getDay(); // 0=Sun
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const days: CalendarDay[] = [];

    // days from previous month to fill
    for (let i = 0; i < startWeekDay; i++) {
      const date = new Date(year, month, i - startWeekDay + 1);
      days.push({date, inMonth: false, habits: []});
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dayHabits = this.matchHabitsForDate(date, habits);
      days.push({date, inMonth: true, habits: dayHabits});
    }

    // Fill up to full weeks (42 cells max)
    while (days.length % 7 !== 0) {
      const last = days[days.length - 1].date;
      const next = new Date(last.getFullYear(), last.getMonth(), last.getDate() + 1);
      days.push({date: next, inMonth: false, habits: []});
    }

    return days;
  }

  private matchHabitsForDate(date: Date, habits: IHabit[]): IHabit[] {
    return habits.filter(h => {
      if (!h.startDate) return false;
      const start = new Date(h.startDate);
      if (date < start) return false;
      switch (h.frequency) {
        case 1: // Frequency.Daily
          return true;
        case 2: // Frequency.Weekly
          return date.getDay() === start.getDay();
        case 3: // Frequency.Custom (placeholder mensual misma fecha)
          return date.getDate() === start.getDate();
        default:
          return false;
      }
    });
  }
}
