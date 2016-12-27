/* @flow */

import type { AstNode } from './ast';
import type { NodeWriter } from './node';
import type { Context } from './gate';

export type ShouldWalk = (node: AstNode) => boolean;
export type Walker = (ctx: Context, writer: NodeWriter, node: AstNode, walk: Walker) => Context;

function nodeLocation(node: AstNode): string {
  return `${node.loc.start.line}:${node.loc.start.column} - ${node.loc.end.line}:${node.loc.end.column}`;
}


class WalkerRegistry {
  walkers: Array<[ShouldWalk, Walker]>;

  constructor() {
    this.walkers = [];
  }

  find(node: AstNode): Walker {
    for (const [shouldWalk, walker] of this.walkers) {
      if (shouldWalk(node)) {
        return walker;
      }
    }
    throw Error(`Walk Not Implemented: ${node.type} at ${nodeLocation(node)}`);
  }

  addWalker(shouldWalk: ShouldWalk, walker: Walker): void {
    this.walkers.push([shouldWalk, walker]);
  }
}

export default new WalkerRegistry();
