/* @flow */

import type { Node as AstNode } from 'babylon';

import type { NodeWriter } from './node';
import { Chunk } from './chunk';
import Context from './context';

import tokenize from './tokenize';
import solve from './solve';
import type { Walker } from './registry';
import registry from './registry';
import { walkComments } from './walk';

import './transforms/program';
import './transforms/declarations';
import './transforms/statements';
import './transforms/expressions';
import './transforms/properties';
import './transforms/literals';

function walk(ctx: Context, writer: NodeWriter, node: AstNode, walk: Walker): Context {
  if (node.leadingComments) {
    for (const comment of node.leadingComments) {
      ctx = walkComments(ctx, writer, comment);
    }
  }

  const walker = registry.find(node);
  return walker(ctx, writer, node, walk);
}

export default function* (node: AstNode, limit: number): Iterable<string> {
  const root = new Chunk();
  walk(new Context(), root, node, walk);
  const switches = solve(root, limit);
  yield* tokenize(root, switches);
}
