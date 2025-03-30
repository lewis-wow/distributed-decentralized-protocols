import { describe, expect, test } from 'vitest';
import { KademliaDHT } from './KademliaDHT';
import { Node } from './Node';

describe('KademliaDHT', () => {
  test('Store and retrieve data', () => {
    const dht = new KademliaDHT();

    const nodeA = new Node('nodeA');
    const nodeB = new Node('nodeB');

    dht.joinNetwork(nodeA);
    dht.joinNetwork(nodeB);

    const key = 'nodeB';
    const value = 'Stored in DHT';

    dht.storeData(key, value);
    const retrieved = dht.retrieveData(key);

    expect(retrieved).toBe(value);

    /**
     * Data should be stored in node B as it is the closest node to the key.
     * The key is the same as the node ID.
     */
    expect(nodeB.data.get(key)).toBe(value);
  });

  test('Join and transfer data', () => {
    const dht = new KademliaDHT();

    const nodeA = new Node('nodeA');
    const nodeB = new Node('nodeB');

    dht.joinNetwork(nodeA);
    dht.joinNetwork(nodeB);

    const key = 'nodeC';
    const value = 'Stored in DHT';

    dht.storeData(key, value);

    expect(dht.retrieveData(key)).toBe(value);

    const nodeC = new Node('nodeC');
    dht.joinNetwork(nodeC);

    expect(dht.retrieveData(key)).toBe(value);

    /**
     * Data should be stored in node C as it is the closest node to the key.
     * The key is the same as the node ID.
     */
    expect(nodeC.data.get(key)).toBe(value);
  });
});
