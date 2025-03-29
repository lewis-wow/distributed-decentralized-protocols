import { INetwork } from '@repo/types/INetwork';
import { Node } from './Node';

export class SkipGraph implements INetwork {
  nodes: Node[] = [];
}
