import keccak256 from 'keccak256';

export class Hash {
  /**
   * This method hashes the raw value to create a unique ID for that value.
   * @param value
   * @returns keccak256 hash of the value
   */
  static keccak256(data: string): string {
    const hash = keccak256(data);
    const hex = hash.toString('hex');

    return `0x${hex}`;
  }
}
