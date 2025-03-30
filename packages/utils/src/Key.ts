import { IKey } from '@repo/types/IKey';

export class Key implements IKey {
  /**
   * The ID of the key.
   * This is the original string that was used to create the key.
   */
  readonly id: string;

  constructor(id: string) {
    this.id = id;
  }

  static toKey(key: string | Key): Key {
    if (typeof key === 'string') {
      return new this(key);
    }

    return key;
  }
}
