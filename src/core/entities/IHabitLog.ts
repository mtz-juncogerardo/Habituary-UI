import {IEntity} from './IEntity';
import {IMood} from './IMood';

export interface IHabitLog extends IEntity {
  habitIRN: string;
  moodIRN: string;
  completedFlag: boolean;
  notes: string;
  logDate: Date;
  mood: IMood;
}
