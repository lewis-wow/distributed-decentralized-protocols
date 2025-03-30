import { INode } from '@repo/types/INode';
import { HashKey } from '@repo/utils/HashKey';
import { Hash } from '../../../packages/utils/src/Hash';
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
  key: HashKey;

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

  constructor(id: string) {
    this.key = new HashKey(id);

    log.info(`Node created`, {
      id: this.key.id,
      hash: this.key.hash,
    });
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
  static xorDistance(targetHashKey1: HashKey, targetHashKey2: HashKey): number {
    const targetHashKey1Binary = BigInt(targetHashKey1.hash);
    const targetHashKey2Binary = BigInt(targetHashKey2.hash);

    const xorResult = targetHashKey1Binary ^ targetHashKey2Binary;

    const xorResultBinary = xorResult.toString(2);

    const distance = xorResultBinary.split('1').length - 1;

    return distance;
  }

  /**
   * This method stores data at the node.
   * The key is the identifier for the data, and the value is the data itself.
   * @param dataKey
   * @param value
   */
  storeData(dataKey: HashKey, value: unknown) {
    log.info(`Storing data at node`, {
      key: this.key,
      dataKey,
      value,
    });

    this.data.set(dataKey.id, value);
  }

  /**
   * This method retrieves data from the node.
   * It returns the value associated with the key if it exists, or null if not.
   * @param dataKey
   * @returns
   */
  getData(dataKey: HashKey): unknown | null {
    log.info(`Getting data at node`, {
      key: this.key,
      dataKey,
    });

    return this.data.get(dataKey.id) ?? null;
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
    if (this.key.id === node.key.id) {
      return;
    }

    /**
     * Check if the node already exists in the routing table
     * If it does, ignore it.
     */
    const existing = this.kBuckets.find(
      (kBucketNode) => kBucketNode.key.id === node.key.id,
    );

    if (existing) {
      return;
    }

    this.kBuckets.push(node);

    this.kBuckets.sort(
      (a, b) =>
        Node.xorDistance(this.key, a.key) - Node.xorDistance(this.key, b.key),
    );

    if (this.kBuckets.length > Node.K) {
      /**
       * Remove the farthest node if exceeding k
       */
      this.kBuckets.pop();
    }

    /**
     * Transfer data to the new node if it is closer to the key.
     * This is done to ensure that the data is stored at the closest node.
     */
    this.transferData(node);
  }

  /**
   * Transfers data to a newly joined node if it is closer to the key.
   * @param newNode The newly joined node.
   */
  transferData(newNode: Node) {
    for (const [dataKey, value] of this.data.entries()) {
      const dataHashKey = HashKey.toKey(dataKey);
      const newClosest = this.findClosestNode(dataHashKey);

      if (newClosest.key.id === newNode.key.id) {
        /**
         * New node is now responsible for this data
         */
        newNode.storeData(dataHashKey, value);

        /**
         * Remove the data from the current node to avoid duplication.
         */
        this.data.delete(dataKey);

        log.info(`Data migrated to new node`, {
          from: this.key,
          to: newNode.key,
          dataKey,
        });
      }
    }
  }

  /**
   * This method finds the closest node to a given target ID.
   * @param dataKey
   * @param opts
   * @returns The closest node to the target ID. If no nodes are found, it returns itself.
   */
  findClosestNode(dataKey: HashKey, opts?: IOptions): Node {
    opts?.path?.addNode(this);

    const closestKnownNode = this.getClosestKnownNode(dataKey);

    /**
     * If there are no known nodes, return itself.
     * If the closest known node is itself, return itself.
     */
    if (this.key.id === closestKnownNode.key.id) {
      return this;
    }

    /**
     * Recursively find the closest node in the routing table.
     * Keep track of visited nodes to avoid cycles.
     * This is important to prevent infinite loops in the network.
     */
    const closestNode = closestKnownNode.findClosestNode(dataKey, opts);

    return closestNode;
  }

  /**
   * Returns the closest known node in the routing table.
   *
   * @param dataKey The target ID to find the closest node to.
   * @returns The closest known node or null if no nodes are known.
   */
  private getClosestKnownNode(dataKey: HashKey): Node {
    if (this.kBuckets.length === 0) {
      return this;
    }

    return this.kBuckets.reduce((kBucketNodeA, kBucketNodeB) => {
      const aDistance = Node.xorDistance(kBucketNodeA.key, dataKey);
      const bDistance = Node.xorDistance(kBucketNodeB.key, dataKey);

      return aDistance < bDistance ? kBucketNodeA : kBucketNodeB;
    }, this);
  }
}
