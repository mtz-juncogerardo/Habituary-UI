import {IEntity} from './IEntity';

export interface IMood extends IEntity {
  name: string;
  emoji: string;
  systemFlag: boolean;
  userIRN: string;
}
