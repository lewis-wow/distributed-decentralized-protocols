import { INode } from './INode';

export interface IPath {
  addNode(node: INode): void;
  getPath(): INode[];
}
