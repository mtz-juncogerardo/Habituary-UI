import {IEntity} from './IEntity';
import {Frequency} from '../enums/Frequency';
import {IReminder} from './IReminder';
import {IHabitLog} from './IHabitLog';

export interface IHabit extends IEntity {
  userIRN: string;
  title: string;
  description: string;
  frequency: Frequency;
  startDate: Date;
  reminders: IReminder[];
  habitLogs: IHabitLog[];
}
