import { INode } from '@repo/types/INode';

/**
 * This class represents a node in a Gossip-based network.
 * Each node has a unique ID and a list of peers.
 * The node propagates messages to a subset of its peers to ensure message dissemination.
 */
export class Node implements INode {
  id: string;

  /**
   * The data stored at the node.
   */
  data = new Map<string, unknown>();

  constructor(id: string) {
    this.id = id;
  }
}
