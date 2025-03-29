import { INetwork } from '@repo/types/INetwork';
import { IOptions } from './IOptions';
import { log } from './logger';
import { Node } from './Node';

export class KademliaDHT implements INetwork {
  nodes: Node[] = [];

  /**
   * Join the network with a new node
   * @param newNode The new node to join the network
   * @returns void
   */
  joinNetwork(newNode: Node) {
    log.info(`Node joining the network`, {
      id: newNode.id,
    });

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
   * @param key
   * @param value
   * @returns void
   */
  storeData(key: string, value: string, opts?: IOptions) {
    if (this.nodes.length === 0) {
      log.error('No nodes in the network to store data.');
      return;
    }

    const targetId = Node.hash(key);

    const randomNode = this.getRandomNode();

    /**
     * Find the closest node to the target ID using XOR distance.
     * The closest node is responsible for storing the data.
     */
    const closestNode = randomNode?.findClosestNode(targetId, opts);

    closestNode?.storeData(key, value);

    log.info(`Data stored successfully at node`, {
      id: closestNode?.id,
      rawId: closestNode?.rawId,
      key,
      value,
    });
  }

  /**
   * This method retrieves data from the closest node to the given key.
   * @param key
   */
  retrieveData(key: string, opts?: IOptions): unknown | null {
    if (this.nodes.length === 0) {
      log.info('No nodes in the network to retrieve data.');
      return null;
    }

    const targetId = Node.hash(key);

    const randomNode = this.getRandomNode();

    /**
     * Find the closest node to the target ID using XOR distance.
     * The closest node is responsible for retrieving the data.
     */
    const closestNode = randomNode?.findClosestNode(targetId, opts);

    return closestNode?.getData(key);
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
