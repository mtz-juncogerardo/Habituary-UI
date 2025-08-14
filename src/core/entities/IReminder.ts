import {IEntity} from './IEntity';
import {DaysOfWeek} from '../enums/DaysOfWeek';

export interface IReminder extends IEntity {
  habitIRN: string;
  timeOfDay: string; // HH:mm:ss or ISO partial; backend TimeSpan
  daysOfWeek: DaysOfWeek[];
  activeFlag: boolean;
}
