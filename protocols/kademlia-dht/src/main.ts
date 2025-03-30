import { Path } from '@repo/logger/src/Path';
import { KademliaDHT } from './KademliaDHT';
import { log } from './logger';
import { Node } from './Node';

const dht = new KademliaDHT();

const nodeA = new Node('nodeA');
const nodeB = new Node('nodeB');
const nodeC = new Node('nodeC');
const nodeD = new Node('nodeD');

dht.joinNetwork(nodeA);
dht.joinNetwork(nodeB);
dht.joinNetwork(nodeC);
dht.joinNetwork(nodeD);

let key = 'nodeE';
let value = 'Stored in DHT';

dht.storeData(key, value);

let path = new Path<Node>();
log.info('Retrieved data from DHT', {
  key,
  retrieved: dht.retrieveData(key, { path }),
  path: path.getPath().map((node) => node.key.id),
});

const nodeE = new Node('nodeE');
dht.joinNetwork(nodeE);

path = new Path<Node>();
log.info('Retrieved data from DHT', {
  key,
  retrieved: dht.retrieveData(key, { path }),
  path: path.getPath().map((node) => node.key.id),
});
