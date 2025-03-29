import { Path } from '@repo/logger/src/Path';
import { KademliaDHT } from './KademliaDHT';
import { log } from './logger';
import { Node } from './Node';

const dht = new KademliaDHT();

const nodeA = new Node('nodeA');
const nodeB = new Node('nodeB');
const nodeC = new Node('nodeC');
const nodeD = new Node('nodeD');
const nodeE = new Node('nodeE');

dht.joinNetwork(nodeA);
dht.joinNetwork(nodeB);
dht.joinNetwork(nodeC);
dht.joinNetwork(nodeD);
dht.joinNetwork(nodeE);

const key = 'key1';
const value = 'Stored in DHT';

const path = new Path();

dht.storeData(key, value, { path });

log.info('Stored data in DHT', {
  key,
  value,
  path: path
    .getPath()
    .map((node) => (node as { id: string; rawId: string }).rawId),
});

log.info('Retrieved data from DHT', {
  key,
  retrieved: dht.retrieveData(key),
});
