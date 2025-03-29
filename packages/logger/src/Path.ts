import { INode } from '@repo/types/INode';
import { IPath } from '@repo/types/IPath';

export class Path<TNode extends INode = INode> implements IPath {
  private path: TNode[] = [];

  addNode(node: TNode) {
    this.path.push(node);
  }

  getPath(): TNode[] {
    return this.path;
  }
}
