import { Logger } from '@repo/logger';
import { name } from '../package.json';

/**
 * Logger for the Kademlia DHT network.
 */
export const log = new Logger(name.replace('@repo/', ''));
