import { INetwork } from '@repo/types/INetwork';
import { Node } from './Node';

export class SmallWorldRouting implements INetwork {
  nodes: Node[] = [];
}
