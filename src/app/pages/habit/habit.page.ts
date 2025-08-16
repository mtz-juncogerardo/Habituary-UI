import {Component, inject, OnInit, signal} from '@angular/core';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {CommonModule} from '@angular/common';
import {DataService} from '../../services/data.service';
import {IHabit} from '../../../core/entities/IHabit';
import {Frequency} from '../../../core/enums/Frequency';
import {IUser} from '../../../core/entities/IUser';
import {lastValueFrom} from 'rxjs';
import {ToasterService} from '../../services/toaster.service';
import {HabituaryButtonComponent} from '../../components/habituary-button/habituary-button.component';

@Component({
  selector: 'app-habit-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, HabituaryButtonComponent],
  templateUrl: './habit.page.html',
  styleUrl: './habit.page.css'
})
export class HabitPageComponent implements OnInit {
  habit = signal<IHabit | null>(null);
  loadingFlag = signal(true);
  savingFlag = signal(false);
  deletingFlag = signal(false);
  completingFlag = signal(false);
  newHabitFlag = signal(false);
  habitForm!: FormGroup;
  irn = '';
  currentUser = signal<IUser | null>(null);
  loadingUserFlag = signal(false);
  frequencies = [
    {value: Frequency.Daily, label: 'Diario'},
    {value: Frequency.Weekly, label: 'Semanal'},
    {value: Frequency.Monthly, label: 'Mensual'},
    {value: Frequency.Custom, label: 'Personalizado'}
  ];
  private route = inject(ActivatedRoute);
  private data = inject(DataService);
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private toaster = inject(ToasterService);

  get titleInvalidFlag() {
    const c = this.habitForm.get('titleForm');
    return c?.touched && c.invalid;
  }

  get startDateInvalidFlag() {
    const c = this.habitForm.get('startDateForm');
    return c?.touched && c.invalid;
  }

  async ngOnInit() {
    this.irn = this.route.snapshot.paramMap.get('irn') || '';
    this.newHabitFlag.set(!this.irn);
    this.loadingUserFlag.set(true);
    await this.loadUser();
    const startDateParam = this.route.snapshot.queryParamMap.get('startDate');
    const startDateValid = startDateParam && !isNaN(Date.parse(startDateParam)) ? startDateParam : this.toInputDate(new Date());
    this.buildForm(startDateValid);
    if (this.irn) {
      await this.loadHabit();
    } else {
      this.loadingFlag.set(false);
    }
  }

  async save() {
    if (this.habitForm.invalid) return;
    this.savingFlag.set(true);
    try {
      if (this.newHabitFlag()) {
        if (!this.currentUser()) {
          this.toaster.error('No se encontró usuario');
          return;
        }
        const newHabit: IHabit = {
          irn: undefined,
          userIRN: this.currentUser()!.irn!,
          title: this.habitForm.value.titleForm,
          description: this.habitForm.value.descriptionForm,
          frequency: this.habitForm.value.frequencyForm,
          startDate: new Date(this.habitForm.value.startDateForm),
          reminders: [],
          habitLogs: []
        } as IHabit;
        const created = await lastValueFrom(this.data.create<IHabit>('habit', newHabit));
        this.habit.set(created);
        this.newHabitFlag.set(false);
        if (created.irn) {
          this.irn = created.irn;
          this.router.navigate(['/habit', created.irn]);
        }
        this.toaster.success('Hábito creado');
      } else if (this.habit()) {
        const current = this.habit()!;
        const updated: IHabit = {
          ...current,
          title: this.habitForm.value.titleForm,
          description: this.habitForm.value.descriptionForm,
          frequency: this.habitForm.value.frequencyForm,
          startDate: new Date(this.habitForm.value.startDateForm),
          reminders: current.reminders || [],
          habitLogs: current.habitLogs || []
        };
        const saved = await lastValueFrom(this.data.update<IHabit>('habit', this.irn, updated));
        this.habit.set(saved);
        this.toaster.success('Hábito guardado');
      }
    } finally {
      this.savingFlag.set(false);
    }
  }

  async complete() {
    if (this.newHabitFlag() || !this.habit()) return; /* ...existing code... */
    this.completingFlag.set(true);
    try {
      const body = {habitIRN: this.irn, completedFlag: true, notes: '', logDate: new Date()} as any;
      await lastValueFrom(this.data.create<any>('habitLog', body));
      this.toaster.success('Hábito completado');
    } finally {
      this.completingFlag.set(false);
    }
  }

  async delete() {
    if (this.newHabitFlag() || !this.habit()) return; /* ...existing code... */
    this.deletingFlag.set(true);
    try {
      await lastValueFrom(this.data.delete('habit', this.irn));
      this.toaster.info('Hábito eliminado');
      this.router.navigate(['/dashboard']);
    } finally {
      this.deletingFlag.set(false);
    }
  }

  private async loadUser() {
    try {
      const res = await lastValueFrom(this.data.getAll<IUser>('user'));
      const user = Array.isArray(res) ? (res[0] ?? null) : (res as any as IUser);
      this.currentUser.set(user);
    } finally {
      this.loadingUserFlag.set(false);
    }
  }

  private buildForm(initialStartDate: string) {
    this.habitForm = this.fb.group({
      titleForm: ['', [Validators.required, Validators.maxLength(100)]],
      descriptionForm: ['', [Validators.maxLength(500)]],
      frequencyForm: [Frequency.Daily, [Validators.required]],
      startDateForm: [initialStartDate, [Validators.required]]
    });
  }

  private async loadHabit() {
    try {
      const habitEntity = await lastValueFrom(this.data.getById<IHabit>('habit', this.irn));
      this.habit.set(habitEntity);
      this.habitForm.patchValue({
        titleForm: habitEntity.title,
        descriptionForm: habitEntity.description,
        frequencyForm: habitEntity.frequency,
        startDateForm: this.toInputDate(habitEntity.startDate)
      });
    } finally {
      this.loadingFlag.set(false);
    }
  }

  private toInputDate(date: Date | string): string {
    const d = new Date(date);
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${d.getFullYear()}-${m}-${day}`;
  }
}
