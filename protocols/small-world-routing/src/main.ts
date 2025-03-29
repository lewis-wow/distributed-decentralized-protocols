import { log } from './logger';
import { Node } from './Node';
import { SmallWorldRouting } from './SmallWorldRouting';

const smallWorldRouting = new SmallWorldRouting();

const nodeA = new Node('nodeA');
const nodeB = new Node('nodeB');
const nodeC = new Node('nodeC');

log.info('test');
