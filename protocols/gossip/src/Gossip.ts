import { INetwork } from '@repo/types/INetwork';
import { Node } from './Node';

export class Gossip implements INetwork {
  nodes: Node[] = [];
}
