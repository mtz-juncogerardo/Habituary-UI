import {Component, EventEmitter, Input, Output} from '@angular/core';
import {CommonModule, DatePipe} from '@angular/common';
import {IHabit} from '../../../core/entities/IHabit';
import {Frequency} from '../../../core/enums/Frequency';
import {HabituaryButtonComponent} from '../habituary-button/habituary-button.component';

@Component({
  selector: 'app-habit-banner',
  standalone: true,
  imports: [CommonModule, DatePipe, HabituaryButtonComponent],
  templateUrl: './habit-banner.component.html',
  styleUrl: './habit-banner.component.css'
})
export class HabitBannerComponent {
  @Input() habit!: IHabit;
  @Input() selected = false;
  @Output() toggle = new EventEmitter<IHabit>();
  @Output() edit = new EventEmitter<IHabit>();

  get nextLimitDate(): Date | null {
    if (!this.habit?.startDate) return null;
    const start = new Date(this.habit.startDate);
    switch (this.habit.frequency) {
      case Frequency.Daily:
        return new Date(start.getFullYear(), start.getMonth(), start.getDate() + 1);
      case Frequency.Weekly:
        return new Date(start.getFullYear(), start.getMonth(), start.getDate() + 7);
      default:
        return null;
    }
  }

  frequencyLabel(value: Frequency | number): string {
    switch (value) {
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

  isNextLimitTomorrow(): boolean {
    const limit = this.nextLimitDate;
    if (!limit || !this.habit?.startDate) return false;
    const start = new Date(this.habit.startDate);
    // Normalizar fechas (solo componente día)
    const startUTC = Date.UTC(start.getFullYear(), start.getMonth(), start.getDate());
    const limitUTC = Date.UTC(limit.getFullYear(), limit.getMonth(), limit.getDate());
    const diffDays = Math.round((limitUTC - startUTC) / 86400000);
    return diffDays === 1; // un día después de la fecha de inicio
  }

  onToggle(event: Event) {
    event.stopPropagation();
    this.toggle.emit(this.habit);
  }

  onEdit(event: Event) {
    event.stopPropagation();
    this.edit.emit(this.habit);
  }
}
