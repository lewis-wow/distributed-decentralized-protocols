import { IKey } from './IKey';

export abstract class AbsKey implements IKey {
  /**
   * The ID of the node.
   * Hashed from the raw ID.
   */
  id: string;
  rawId: string;

  constructor(rawId: string) {
    this.rawId = rawId;
    this.id = this.hash(rawId);
  }

  protected abstract hash(value: string): string;
}
