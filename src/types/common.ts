import { DecodedUser } from './entities';

export interface IExpandRequestObject extends Request {
  user: DecodedUser;
}
