import { INetwork } from '@repo/types/INetwork';
import { Node } from './Node';

export class Flooding implements INetwork {
  nodes: Node[] = [];
}
