import { Hash } from './Hash';
import { Key } from './Key';

export type CreateHashFn = (value: string) => string;

export class HashKey extends Key {
  /**
   * The hashed ID of the key.
   * This is the keccak256 hash of the raw ID.
   */
  readonly hash: string;

  constructor(id: string) {
    super(id);

    this.hash = Hash.keccak256(id);
  }

  static override toKey(key: string | HashKey): HashKey {
    return super.toKey(key) as HashKey;
  }
}
