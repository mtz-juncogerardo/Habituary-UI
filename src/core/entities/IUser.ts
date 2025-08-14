import {IEntity} from './IEntity';

export interface IUser extends IEntity {
  email: string;
  username: string;
}
