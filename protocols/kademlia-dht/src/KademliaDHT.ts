import { INetwork } from '@repo/types/INetwork';
import { HashKey } from '@repo/utils/HashKey';
import { IOptions } from './IOptions';
import { log } from './logger';
import { Node } from './Node';

/**
 * This class represents a Kademlia DHT network.
 * It is a distributed hash table (DHT) that uses the Kademlia algorithm.
 * Kademlia is a peer-to-peer information system that uses a XOR distance metric to find the closest nodes to a given target ID.
 * The DHT is used to store and retrieve data in a distributed manner.
 * The DHT is a decentralized network, meaning that there is no central server.
 * Each node in the network is responsible for storing and retrieving data.
 */
export class KademliaDHT implements INetwork {
  nodes: Node[] = [];

  /**
   * Join the network with a new node
   * @param newNode The new node to join the network
   * @returns void
   */
  joinNetwork(newNode: Node) {
    if (this.nodes.length === 0) {
      this.nodes.push(newNode);

      return;
    }

    this.nodes.push(newNode);

    /**
     * Update the routing table of all nodes in the network
     */
    this.nodes.forEach((existingNode) => {
      existingNode.addToRoutingTable(newNode);
      newNode.addToRoutingTable(existingNode);
    });
  }

  /**
   * This method finds the closest node to the given key and stores the data there.
   * It uses XOR distance to determine the closest node.
   * The key is assumed to be the ID used to locate data.
   * The value is the data to be stored.
   * @param dataKey
   * @param value
   * @param opts
   * @returns void
   */
  storeData(dataKey: string | HashKey, value: string, opts?: IOptions) {
    if (this.nodes.length === 0) {
      throw new Error('No nodes in the network to store data.');
    }

    const dataHashKey = HashKey.toKey(dataKey);

    const randomNode = this.getRandomNode();

    /**
     * Find the closest node to the target ID using XOR distance.
     * The closest node is responsible for storing the data.
     */
    const closestNode = randomNode?.findClosestNode(dataHashKey, opts);

    closestNode?.storeData(dataHashKey, value);
  }

  /**
   * This method retrieves data from the closest node to the given key.
   * @param dataKey
   */
  retrieveData(dataKey: string | HashKey, opts?: IOptions): unknown | null {
    if (this.nodes.length === 0) {
      throw new Error('No nodes in the network to retrieve data.');
    }

    const dataHashKey = HashKey.toKey(dataKey);

    const randomNode = this.getRandomNode();

    /**
     * Find the closest node to the target ID using XOR distance.
     * The closest node is responsible for retrieving the data.
     */
    const closestNode = randomNode?.findClosestNode(dataHashKey, opts);

    return closestNode?.getData(dataHashKey);
  }

  /**
   * This method selects a random node from the network.
   * @returns A random node from the network
   */
  private getRandomNode(): Node {
    const randomIndex = Math.floor(Math.random() * this.nodes.length);

    if (this.nodes.length === 0) {
      throw new Error('No nodes in the network to select a random node.');
    }

    return this.nodes[randomIndex]!;
  }
}
