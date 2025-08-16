import {Component, computed, Input, OnChanges, signal, SimpleChanges} from '@angular/core';
import {IHabit} from '../../../core/entities/IHabit';
import {DatePipe} from '@angular/common';
import {HabitChipComponent} from '../habit-chip/habit-chip.component';
import {Router} from '@angular/router';

interface CalendarDay {
  date: Date;
  inMonth: boolean;
  habits: IHabit[];
}

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [DatePipe, HabitChipComponent],
  templateUrl: './calendar.component.html',
  styleUrl: './calendar.component.css'
})
export class CalendarComponent implements OnChanges {
  month = signal<Date>(new Date());
  readonly daysOfWeek = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  private habitsSignal = signal<IHabit[]>([]);
  calendarDays = computed<CalendarDay[]>(() => this.buildCalendar(this.month(), this.habitsSignal()));

  constructor(private router: Router) {
  }

  @Input() set habits(value: IHabit[]) {
    this.habitsSignal.set(value || []);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['habits']) { /* handled by signal */
    }
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

  isToday(checkDate: Date): boolean {
    const todayReference = new Date();
    return checkDate.getFullYear() === todayReference.getFullYear() &&
      checkDate.getMonth() === todayReference.getMonth() &&
      checkDate.getDate() === todayReference.getDate();
  }

  handleDayClick(calendarDay: CalendarDay) {
    const y = calendarDay.date.getFullYear();
    const m = String(calendarDay.date.getMonth() + 1).padStart(2, '0');
    const d = String(calendarDay.date.getDate()).padStart(2, '0');
    const isoDate = `${y}-${m}-${d}`;
    this.router.navigate(['/habit'], {queryParams: {startDate: isoDate}});
  }

  handleViewMoreClick(event: Event) {
    event.stopPropagation();
    this.router.navigate(['/habit-list']);
  }

  handleViewMoreClickForDay(event: Event, date: Date) {
    event.stopPropagation();
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    const iso = `${y}-${m}-${d}`;
    this.router.navigate(['/habit-list'], {queryParams: {date: iso}});
  }

  trackDay = (_index: number, calendarDay: CalendarDay) => calendarDay.date;
  trackHabit = (_index: number, habitItem: IHabit) => habitItem.irn;

  private shiftMonth(deltaMonths: number) {
    const currentMonthDate = this.month();
    this.month.set(new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth() + deltaMonths, 1));
  }

  private buildCalendar(currentDate: Date, habitList: IHabit[]): CalendarDay[] {
    const year = currentDate.getFullYear();
    const monthIndex = currentDate.getMonth();
    const firstMonthDay = new Date(year, monthIndex, 1);
    const leadingWeekDayIndex = firstMonthDay.getDay();
    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();

    const calendarDayList: CalendarDay[] = [];

    for (let leadingIndex = 0; leadingIndex < leadingWeekDayIndex; leadingIndex++) {
      const previousMonthDate = new Date(year, monthIndex, leadingIndex - leadingWeekDayIndex + 1);
      calendarDayList.push({date: previousMonthDate, inMonth: false, habits: []});
    }

    for (let dayNumber = 1; dayNumber <= daysInMonth; dayNumber++) {
      const inMonthDate = new Date(year, monthIndex, dayNumber);
      const habitsForDay = this.matchHabitsForDate(inMonthDate, habitList);
      calendarDayList.push({date: inMonthDate, inMonth: true, habits: habitsForDay});
    }

    while (calendarDayList.length % 7 !== 0) {
      const lastCalendarDate = calendarDayList[calendarDayList.length - 1].date;
      const nextOverflowDate = new Date(lastCalendarDate.getFullYear(), lastCalendarDate.getMonth(), lastCalendarDate.getDate() + 1);
      calendarDayList.push({date: nextOverflowDate, inMonth: false, habits: []});
    }

    return calendarDayList;
  }

  private matchHabitsForDate(targetDate: Date, habitList: IHabit[]): IHabit[] {
    return habitList.filter(habitItem => {
      if (!habitItem.startDate) return false;
      const startDateReference = new Date(habitItem.startDate);
      if (targetDate < startDateReference) return false;
      switch (habitItem.frequency) {
        case 1:
          return true; // Daily
        case 2:
          return targetDate.getDay() === startDateReference.getDay(); // Weekly
        case 3:
          return targetDate.getDate() === startDateReference.getDate(); // Custom monthly placeholder
        default:
          return false;
      }
    });
  }
}
