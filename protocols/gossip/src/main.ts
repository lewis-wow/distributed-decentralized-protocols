import { Gossip } from './Gossip';
import { log } from './logger';
import { Node } from './Node';

const gossip = new Gossip();

const nodeA = new Node('nodeA');
const nodeB = new Node('nodeB');
const nodeC = new Node('nodeC');

log.info('test');
