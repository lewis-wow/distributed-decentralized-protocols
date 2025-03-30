import { INode } from '@repo/types/INode';
import { AbsKey } from './AbsKey';
import { Hash } from './Hash';
import { IKey } from './IKey';
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
export class Node extends AbsKey implements INode {
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
  static readonly K = 2;

  constructor(rawId: string) {
    super(rawId);

    log.info(`Node created`, {
      id: this.id,
      rawId: this.rawId,
    });
  }

  protected hash(value: string): string {
    return Hash.keccak256(value);
  }

  /**
   * This method calculates the XOR distance between two node IDs.
   * The XOR distance is the sum of the bitwise XOR of each character in the IDs.
   * This is used to determine the closeness of two nodes in the network.
   * The smaller the distance, the closer the nodes are.
   * @param targetHashKey1
   * @param targetHashKey2
   * @returns
   */
  static xorDistance(targetHashKey1: IKey, targetHashKey2: IKey): number {
    const targetHashKey1Binary = BigInt(targetHashKey1.id);
    const targetHashKey2Binary = BigInt(targetHashKey2.id);

    const distance = Number(targetHashKey1Binary ^ targetHashKey2Binary);

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
      (a, b) => Node.xorDistance(this, a) - Node.xorDistance(this, b),
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
   * @param targetHashKey
   * @param visited A set of visited nodes to avoid cycles.
   * @returns The closest node to the target ID. If no nodes are found, it returns itself.
   */
  findClosestNode(targetHashKey: IKey, opts?: IOptions) {
    return this._findClosestNode(targetHashKey, new Set<string>(), opts);
  }

  _findClosestNode(
    targetHashKey: IKey,
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

    const closestKnownNode = this.getClosestKnownNode(targetHashKey);

    /**
     * If there are no known nodes, return itself.
     * If the closest known node is itself, return itself.
     */
    if (!closestKnownNode || this.id === closestKnownNode.id) {
      return this;
    }

    console.log('FFF', this.rawId, closestKnownNode.rawId);

    const thisDistance = Node.xorDistance(this, targetHashKey);
    const closestKnownNodeDistance = Node.xorDistance(
      closestKnownNode,
      targetHashKey,
    );

    log.info(`Finding closest node`, {
      rawId: this.rawId,
      key: targetHashKey.rawId,
      distance: thisDistance,
    });

    log.info(`Finding closest node`, {
      rawId: closestKnownNode.rawId,
      key: targetHashKey.rawId,
      distance: closestKnownNodeDistance,
    });

    /**
     * If the closest known node is closer to the target ID than itself, return itself.
     * Otherwise, recursively find the closest node in the routing table.
     * This is done to find the closest node in the network.
     */
    if (thisDistance < closestKnownNodeDistance) {
      return this;
    }

    /**
     * Recursively find the closest node in the routing table.
     * Keep track of visited nodes to avoid cycles.
     * This is important to prevent infinite loops in the network.
     */
    const closestNode = closestKnownNode._findClosestNode(
      targetHashKey,
      visited,
      opts,
    );

    return closestNode;
  }

  /**
   * Returns the closest known node in the routing table.
   *
   * @param targetHashKey The target ID to find the closest node to.
   * @returns The closest known node or null if no nodes are known.
   */
  private getClosestKnownNode(targetHashKey: IKey): Node | null {
    if (this.kBuckets.length === 0) {
      return null;
    }

    return this.kBuckets.reduce((a, b) => {
      const aDistance = Node.xorDistance(a, targetHashKey);
      const bDistance = Node.xorDistance(b, targetHashKey);

      return aDistance < bDistance ? a : b;
    });
  }
}
