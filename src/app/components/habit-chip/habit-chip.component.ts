import {Component, Input} from '@angular/core';
import {Router} from '@angular/router';
import {IHabit} from '../../../core/entities/IHabit';

@Component({
  selector: 'app-habit-chip',
  standalone: true,
  templateUrl: './habit-chip.component.html',
  styleUrl: './habit-chip.component.css'
})
export class HabitChipComponent {
  @Input() habit!: IHabit; // se asume válido

  constructor(private router: Router) {
  }

  get label() {
    return this.habit?.title || '';
  }

  get title() {
    return this.habit?.description || this.label;
  }

  onClick(event: MouseEvent) {
    event.stopPropagation();
    this.navigate();
  }

  navigate() {
    if (this.habit?.irn) {
      this.router.navigate(['/habit', this.habit.irn]);
    }
  }
}
