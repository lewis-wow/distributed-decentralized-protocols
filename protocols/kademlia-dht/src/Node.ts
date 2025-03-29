import { INode } from '@repo/types/INode';
import keccak256 from 'keccak256';
import { IOptions } from './IOptions';
import { log } from './logger';

/**
 * This class represents a node in the Kademlia DHT network.
 * Each node has a unique ID and a routing table.
 * The routing table is a list of nodes that this node knows about.
 * The routing table is used to find the closest nodes to a given target ID.
 * The closest nodes are used to store and retrieve data.
 * The node also has a data store, which is a key-value store.
 * The key is the identifier for the data, and the value is the data itself.
 * The data store is used to store and retrieve data.
 * The node can store and retrieve data from its own data store.
 * The node can also add other nodes to its routing table.
 * The routing table is limited to k nodes, where k is the k-bucket size.
 */
export class Node implements INode {
  /**
   * The ID of the node.
   * Hashed from the raw ID.
   */
  id: string;
  rawId: string;

  /**
   * The data stored at the node.
   */
  data = new Map<string, unknown>();

  /**
   * The routing table of the node.
   * This is a list of nodes that this node knows about.
   * Each node is represented by its ID.
   * The routing table is used to find the closest nodes to a given target ID.
   * The routing table is limited to k nodes, where k is the k-bucket size.
   */
  kBuckets: Node[] = [];

  /**
   * Maximum number of nodes to store in the routing table.
   * This is the k-bucket size.
   */
  static K = 2;

  constructor(rawId: string) {
    this.rawId = rawId;
    this.id = Node.hash(rawId);

    log.info(`Node created`, {
      id: this.id,
      rawId: this.rawId,
    });
  }

  /**
   * This method hashes the raw ID of the node to create a unique ID.
   * The hash is created using the SHA-1 algorithm.
   * @param value
   * @returns
   */
  static hash(value: string): string {
    const hash = keccak256(value);
    const hex = hash.toString('hex');

    return `0x${hex}`;
  }

  /**
   * This method calculates the XOR distance between two node IDs.
   * The XOR distance is the sum of the bitwise XOR of each character in the IDs.
   * This is used to determine the closeness of two nodes in the network.
   * The smaller the distance, the closer the nodes are.
   * @param id1
   * @param id2
   * @returns
   */
  static xorDistance(id1: string, id2: string): number {
    const id1Binary = BigInt(id1);
    const id2Binary = BigInt(id2);

    const distance = Number(id1Binary ^ id2Binary);

    return distance;
  }

  /**
   * This method stores data at the node.
   * The key is the identifier for the data, and the value is the data itself.
   * @param key
   * @param value
   */
  storeData(key: string, value: string) {
    log.info(`Storing data at node`, {
      id: this.id,
      key,
      value,
    });

    this.data.set(key, value);
  }

  /**
   * This method retrieves data from the node.
   * It returns the value associated with the key if it exists, or null if not.
   * @param key
   * @returns
   */
  getData(key: string): unknown | null {
    log.info(`Getting data at node`, {
      id: this.id,
      key,
    });

    return this.data.get(key) ?? null;
  }

  /**
   * This method adds a node to the routing table.
   * The routing table is limited to k nodes, where k is the k-bucket size.
   * The node is added to the routing table if it is not already present.
   * The routing table is sorted by XOR distance to the current node.
   * The closest nodes are kept in the routing table.
   * If the routing table exceeds k nodes, the farthest node is removed.
   * @param node
   * @returns
   */
  addToRoutingTable(node: Node) {
    /**
     * Ignore self
     */
    if (this.id === node.id) {
      return;
    }

    /**
     * Check if the node already exists in the routing table
     * If it does, ignore it.
     */
    const existing = this.kBuckets.find((n) => n.id === node.id);

    if (existing) {
      return;
    }

    this.kBuckets.push(node);

    this.kBuckets.sort(
      (a, b) =>
        Node.xorDistance(this.id, a.id) - Node.xorDistance(this.id, b.id),
    );

    if (this.kBuckets.length > Node.K) {
      /**
       * Remove the farthest node if exceeding k
       */
      this.kBuckets.pop();
    }
  }

  /**
   * This method finds the closest node to a given target ID.
   * @param targetId
   * @param visited A set of visited nodes to avoid cycles.
   * @returns The closest node to the target ID. If no nodes are found, it returns itself.
   */
  findClosestNode(targetId: string, opts?: IOptions) {
    return this._findClosestNode(targetId, new Set<string>(), opts);
  }

  _findClosestNode(
    targetId: string,
    visited: Set<string>,
    opts?: IOptions,
  ): Node {
    opts?.path?.addNode(this);
    /**
     * Check if the node has already been visited to avoid cycles.
     * If it has, return itself.
     * This is important to prevent infinite loops in the network.
     */
    if (visited.has(this.id)) {
      return this;
    }

    visited.add(this.id);

    const closestKnownNode = this.getClosestKnownNode(targetId);

    if (
      !closestKnownNode ||
      this.id === closestKnownNode.id ||
      this.isCloserThan(closestKnownNode, targetId)
    ) {
      return this;
    }

    const closestNode = closestKnownNode._findClosestNode(
      targetId,
      visited,
      opts,
    );

    return closestNode;
  }

  /**
   * Returns the closest known node in the routing table.
   *
   * @param targetId The target ID to find the closest node to.
   * @returns The closest known node or null if no nodes are known.
   */
  private getClosestKnownNode(targetId: string): Node | null {
    return this.kBuckets.length
      ? this.kBuckets.reduce((a, b) => (Node.isCloser(a, b, targetId) ? a : b))
      : null;
  }

  /**
   * Checks which node is closer to the targetId.
   *
   * @returns true if nodeA is closer to targetId than nodeB.
   */
  private isCloserThan(nodeB: Node, targetId: string): boolean {
    return Node.isCloser(this, nodeB, targetId);
  }

  static isCloser(nodeA: Node, nodeB: Node, targetId: string): boolean {
    return (
      Node.xorDistance(nodeA.id, targetId) <
      Node.xorDistance(nodeB.id, targetId)
    );
  }
}
