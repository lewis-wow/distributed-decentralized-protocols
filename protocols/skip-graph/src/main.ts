import { log } from './logger';
import { Node } from './Node';
import { SkipGraph } from './SkipGraph';

const skipGraph = new SkipGraph();

const nodeA = new Node('nodeA');
const nodeB = new Node('nodeB');
const nodeC = new Node('nodeC');

log.info('test');
