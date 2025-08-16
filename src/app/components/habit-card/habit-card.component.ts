import {Component, Input} from '@angular/core';
import {CommonModule, DatePipe} from '@angular/common';
import {IHabit} from '../../../core/entities/IHabit';
import {Frequency} from '../../../core/enums/Frequency';
import {Router} from '@angular/router';

@Component({
  selector: 'app-habit-card',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './habit-card.component.html',
  styleUrl: './habit-card.component.css'
})
export class HabitCardComponent {
  @Input({required: true}) habit!: IHabit;

  constructor(private router: Router) {
  }

  get frequencyLabel(): string {
    switch (this.habit?.frequency) {
      case Frequency.Daily:
        return 'Diario';
      case Frequency.Weekly:
        return 'Semanal';
      case Frequency.Custom:
        return 'Personalizado';
      default:
        return 'No establecido';
    }
  }

  get remindersCount(): number {
    return this.habit?.reminders?.length || 0;
  }

  get hasRemindersFlag(): boolean {
    return this.remindersCount > 0;
  }

  openDetail() {
    if (this.habit?.irn) this.router.navigate(['/habit', this.habit.irn]);
  }
}
