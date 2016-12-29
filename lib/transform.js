/* @flow */

import type { AstNode } from './ast';
import type { Node, NodeWriter } from './node';
import { Chunk } from './chunk';
import { Context } from './gate';

import type { Walker } from './registry';
import registry from './registry';
import { nobr, space } from './token';
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
  const walker = registry.find(node);
  if (node.leadingComments) {
    for (const comment of node.leadingComments) {
      ctx = walkComments(ctx, writer, comment);
    }
  }

  ctx = walker(ctx, writer, node, walk);

  if (node.trailingComments) {
    for (const comment of node.trailingComments) {
      writer.append(nobr());
      writer.append(space());
      ctx = walkComments(ctx, writer, comment);
    }
  }
  return ctx;
}

export default function(node: AstNode): Node {
  const root = new Chunk();
  walk(new Context(), root, node, walk);
  return root;
}
