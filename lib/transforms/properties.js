/* @flow */

import type { Node as AstNode } from 'babylon';
import * as t from 'babel-types';
import type { NodeWriter } from '../node';
import type { Walker } from '../registry';
import type Context from '../context';
import registry from '../registry';
import { space, text } from '../token';

registry.addWalker(
  node => t.isObjectProperty(node),
  (ctx: Context, writer: NodeWriter, node: AstNode, walk: Walker) => {
    ctx = walk(ctx, writer, node.key, walk);
    if (!node.shorthand) {
      writer.append(text(':'));
      writer.append(space());
      ctx = walk(ctx, writer, node.value, walk);
    }
    return ctx;
  }
);
