import {Component, computed, inject, OnInit, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {DataService} from '../../services/data.service';
import {IHabit} from '../../../core/entities/IHabit';
import {Frequency} from '../../../core/enums/Frequency';
import {lastValueFrom} from 'rxjs';
import {Router, RouterLink} from '@angular/router';
import {ActivatedRoute} from '@angular/router';
import {HabituaryButtonComponent} from '../../components/habituary-button/habituary-button.component';
import {HabitBannerComponent} from '../../components/habit-banner/habit-banner.component';

@Component({
  selector: 'app-habit-list-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HabituaryButtonComponent, HabitBannerComponent],
  templateUrl: './habit-list.page.html',
  styleUrl: './habit-list.page.css'
})
export class HabitListPageComponent implements OnInit {
  loadingFlag = signal(true);
  habits = signal<IHabit[]>([]);
  filterForm!: FormGroup;
  selectedIRNs = signal<Set<string>>(new Set());
  hasSelectionFlag = computed(() => this.selectedIRNs().size > 0);
  deletingFlag = signal(false);
  private data = inject(DataService);
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private searchTrigger = signal(0);

  filteredHabits = computed(() => {
    // recompute only on search trigger or habits update
    this.searchTrigger();
    const all = this.habits();
    if (!this.filterForm) return all;
    const fromStr = this.filterForm.value.fromDateForm;
    const toStr = this.filterForm.value.toDateForm;
    if (!fromStr || !toStr) return all;
    const fromDate = new Date(fromStr);
    const toDate = new Date(toStr + 'T23:59:59');
    return all.filter(h => this.habitOccursInRange(h, fromDate, toDate));
  });

  async ngOnInit() {
    this.buildForm();
    await this.loadHabits();
    // Procesar query param 'date' si viene del calendario (YYYY-MM-DD)
    const paramDate = this.route.snapshot.queryParamMap.get('date');
    if (paramDate && !isNaN(Date.parse(paramDate))) {
      this.filterForm.patchValue({
        fromDateForm: paramDate,
        toDateForm: paramDate
      }, {emitEvent: false});
      this.search();
    } else {
      // rango anual por defecto ya aplicado, realizar primera búsqueda
      this.search();
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

  openHabit(h: IHabit) {
    if (h.irn) this.router.navigate(['/habit', h.irn]);
  }

  newHabit() {
    this.router.navigate(['/habit']);
  }

  toggleSelect(event: Event, habit: IHabit) { /* retained for checkbox direct usage elsewhere if any */
    event.stopPropagation();
    if (!habit.irn) return;
    const set = new Set(this.selectedIRNs());
    if (set.has(habit.irn)) set.delete(habit.irn); else set.add(habit.irn);
    this.selectedIRNs.set(set);
  }

  toggleSelectFromBanner(habit: IHabit) {
    if (!habit.irn) return;
    const set = new Set(this.selectedIRNs());
    if (set.has(habit.irn)) set.delete(habit.irn); else set.add(habit.irn);
    this.selectedIRNs.set(set);
  }

  isSelected(habit: IHabit): boolean {
    return !!habit.irn && this.selectedIRNs().has(habit.irn);
  }

  async deleteSelected() {
    if (!this.hasSelectionFlag() || this.deletingFlag()) return;
    this.deletingFlag.set(true);
    try {
      const ids = Array.from(this.selectedIRNs());
      await lastValueFrom(this.data.deleteMany('habit', ids));
      // quitar localmente
      this.habits.update(list => list.filter(h => !h.irn || !ids.includes(h.irn!)));
      this.selectedIRNs.set(new Set());
    } finally {
      this.deletingFlag.set(false);
    }
  }

  search() {
    this.searchTrigger.update(v => v + 1);
  }

  private buildForm() {
    const now = new Date();
    const firstYearDay = new Date(now.getFullYear(), 0, 1); // 1 de enero
    const lastYearDay = new Date(now.getFullYear(), 11, 31); // 31 de diciembre
    this.filterForm = this.fb.group({
      fromDateForm: [this.toInputDate(firstYearDay), [Validators.required]],
      toDateForm: [this.toInputDate(lastYearDay), [Validators.required]]
    });
    this.filterForm.valueChanges.subscribe(v => {
      const from = v.fromDateForm;
      const to = v.toDateForm;
      if (from && to && new Date(from) > new Date(to)) {
        // auto-corrección estableciendo to = from
        this.filterForm.patchValue({toDateForm: from}, {emitEvent: false});
      }
    });
  }

  private async loadHabits() {
    try {
      const res = await lastValueFrom(this.data.getAll<IHabit>('habit'));
      this.habits.set(res || []);
    } finally {
      this.loadingFlag.set(false);
    }
  }

  private habitOccursInRange(h: IHabit, fromDate: Date, toDate: Date): boolean {
    if (!h.startDate) return false;
    const start = new Date(h.startDate);
    if (start > toDate) return false;
    switch (h.frequency) {
      case Frequency.Daily:
        return start <= toDate; // daily repeats every day
      case Frequency.Weekly: {
        // find first weekly occurrence >= fromDate
        if (start >= fromDate) return start <= toDate;
        const msPerDay = 86400000;
        const diffDays = Math.floor((fromDate.getTime() - start.getTime()) / msPerDay);
        const weeksOffset = Math.ceil(diffDays / 7);
        const occurrence = new Date(start.getFullYear(), start.getMonth(), start.getDate() + weeksOffset * 7);
        return occurrence <= toDate;
      }
      case Frequency.Custom: { // treat as monthly recurrence for filtering, but no limit date display
        let occurrence = new Date(start);
        if (occurrence >= fromDate) return occurrence <= toDate;
        // advance month by month until >= fromDate or past toDate
        while (occurrence < fromDate) {
          const year = occurrence.getFullYear();
          const month = occurrence.getMonth();
          const day = occurrence.getDate();
          occurrence = new Date(year, month + 1, day);
          if (occurrence.getDate() !== day) { // adjust for month shorter
            occurrence = new Date(year, month + 2, 0); // last day previous if overflow
          }
          if (occurrence > toDate) return false;
        }
        return occurrence <= toDate;
      }
      default:
        return false;
    }
  }

  private toInputDate(date: Date | string): string {
    const d = new Date(date);
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${d.getFullYear()}-${m}-${day}`;
  }
}
