/* @flow */

import type { Node as AstNode } from 'babylon';
import * as t from 'babel-types';
import type { NodeWriter } from '../node';
import type { Walker } from '../registry';
import type { Context } from '../gate';
import registry from '../registry';

registry.addWalker(
  node => t.isProgram(node),
  (ctx: Context, writer: NodeWriter, node: AstNode, walk: Walker) => {
    for (const statement of node.body) {
      ctx = walk(ctx, writer, statement, walk);
    }
    return ctx;
  }
);
