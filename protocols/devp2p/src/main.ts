import { DevP2P } from './DevP2P';
import { log } from './logger';
import { Node } from './Node';

const devP2P = new DevP2P();

const nodeA = new Node('nodeA');
const nodeB = new Node('nodeB');
const nodeC = new Node('nodeC');

log.info('test');
