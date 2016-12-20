/* @flow */

import type { Node as AstNode } from 'babylon';
import type { Node, NodeWriter } from './node';
import { Chunk } from './chunk';
import { Context } from './gate';

import type { Walker } from './registry';
import registry from './registry';

import { walkComments } from './transforms/walk';
import './transforms/program';
import './transforms/declarations';
import './transforms/statements';
import './transforms/expressions';
import './transforms/classes';
import './transforms/properties';
import './transforms/literals';
import './transforms/flow';

function walk(ctx: Context, writer: NodeWriter, node: AstNode, walk: Walker): Context {
  if (node.leadingComments) {
    for (const comment of node.leadingComments) {
      ctx = walkComments(ctx, writer, comment);
    }
  }

  const walker = registry.find(node);
  return walker(ctx, writer, node, walk);
}

export default function(node: AstNode): Node {
  const root = new Chunk();
  walk(new Context(), root, node, walk);
  return root;
}
