/* @flow */

import type { Node as AstNode } from 'babylon';
import * as t from 'babel-types';
import type { NodeWriter } from '../node';
import type { Walker } from '../registry';
import type Context from '../context';
import registry from '../registry';
import { text } from '../token';

registry.addWalker(
  node => t.isIdentifier(node),
  (ctx: Context, writer: NodeWriter, node: AstNode, _walk: Walker) => {
    writer.append(text(node.name));
    return ctx;
  }
);

registry.addWalker(
  node => t.isTemplateElement(node),
  (ctx: Context, writer: NodeWriter, node: AstNode, _walk: Walker) => {
    writer.append(text(node.value.raw));
    return ctx;
  }
);

registry.addWalker(
  node => t.isTemplateLiteral(node),
  (ctx: Context, writer: NodeWriter, node: AstNode, walk: Walker) => {
    writer.append(text('`'));

    const expressions = node.expressions[Symbol.iterator]();
    for (const child of node.quasis) {
      ctx = walk(ctx, writer, child, walk);
      if (!child.tail) {
        const { value: expression } = expressions.next();
        writer.append(text('${'));
        ctx = walk(ctx, writer, expression, walk);
        writer.append(text('}'));
      }
    }
    writer.append(text('`'));
    return ctx;
  }
);

registry.addWalker(
  node => t.isNullLiteral(node),
  (ctx: Context, writer: NodeWriter, _node: AstNode, _walk: Walker) => {
    writer.append(text('null'));
    return ctx;
  }
);

registry.addWalker(
  node => t.isNumericLiteral(node),
  (ctx: Context, writer: NodeWriter, node: AstNode, _walk: Walker) => {
    writer.append(text(node.value.toString()));
    return ctx;
  }
);

registry.addWalker(
  node => t.isBooleanLiteral(node),
  (ctx: Context, writer: NodeWriter, node: AstNode, _walk: Walker) => {
    writer.append(text(node.value.toString()));
    return ctx;
  }
);

registry.addWalker(
  node => t.isStringLiteral(node),
  (ctx: Context, writer: NodeWriter, node: AstNode, _walk: Walker) => {
    writer.append(text(node.extra.raw));
    return ctx;
  }
);

registry.addWalker(
  node => t.isRegExpLiteral(node),
  (ctx: Context, writer: NodeWriter, node: AstNode, _walk: Walker) => {
    writer.append(text(node.extra.raw));
    return ctx;
  }
);
