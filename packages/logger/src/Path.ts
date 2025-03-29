import { INode } from '@repo/types/INode';
import { IPath } from '@repo/types/IPath';

export class Path implements IPath {
  private path: INode[] = [];

  addNode(node: INode) {
    this.path.push(node);
  }

  getPath(): INode[] {
    return this.path;
  }
}
