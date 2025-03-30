import { INetwork } from '@repo/types/INetwork';
import { HashKey } from '@repo/utils/HashKey';
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
      key: newNode.key,
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
   * @param dataKey
   * @param value
   * @param opts
   * @returns void
   */
  storeData(dataKey: string | HashKey, value: string, opts?: IOptions) {
    if (this.nodes.length === 0) {
      log.error('No nodes in the network to store data.');
      return;
    }

    const dataHashKey = HashKey.toKey(dataKey);

    const randomNode = this.getRandomNode();

    /**
     * Find the closest node to the target ID using XOR distance.
     * The closest node is responsible for storing the data.
     */
    const closestNode = randomNode?.findClosestNode(dataHashKey, opts);

    closestNode?.storeData(dataHashKey, value);

    log.info(`Data stored successfully at node`, {
      key: closestNode.key,
      dataKey: dataHashKey,
      value,
    });
  }

  /**
   * This method retrieves data from the closest node to the given key.
   * @param dataKey
   */
  retrieveData(dataKey: string | HashKey, opts?: IOptions): unknown | null {
    if (this.nodes.length === 0) {
      log.info('No nodes in the network to retrieve data.');
      return null;
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
