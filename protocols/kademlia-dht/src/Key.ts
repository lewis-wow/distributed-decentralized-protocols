import { AbsKey } from './AbsKey';
import { Hash } from './Hash';

export class Key extends AbsKey {
  protected hash(value: string): string {
    return Hash.keccak256(value);
  }
}
