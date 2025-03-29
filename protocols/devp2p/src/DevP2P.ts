import { INetwork } from '@repo/types/INetwork';
import { Node } from './Node';

export class DevP2P implements INetwork {
  nodes: Node[] = [];
}
