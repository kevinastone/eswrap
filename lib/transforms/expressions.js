/* @flow */

import type { Node as AstNode } from 'babylon';
import * as t from 'babel-types';
import type { NodeWriter } from '../node';
import type { Walker } from '../registry';
import type Context from '../context';
import registry from '../registry';
import { walkArguments, walkBinaryOperator, walkDestructor } from '../walk';
import { space, text } from '../token';

registry.addWalker(
  node => t.isArrayExpression(node),
  (ctx: Context, writer: NodeWriter, node: AstNode, walk: Walker) => {
    writer.append(text('['));
    ctx = walkArguments(ctx, writer, walk, node.elements);
    writer.append(text(']'));
    return ctx;
  }
);

registry.addWalker(
  node => t.isCallExpression(node),
  (ctx: Context, writer: NodeWriter, node: AstNode, walk: Walker) => {
    ctx = walk(ctx, writer, node.callee, walk);
    writer.append(text('('));
    ctx = walkArguments(ctx, writer, walk, node.arguments);
    writer.append(text(')'));
    return ctx;
  }
);

registry.addWalker(
  node => t.isArrowFunctionExpression(node),
  (ctx: Context, writer: NodeWriter, node: AstNode, walk: Walker) => {
    const isBlock = t.isBlockStatement(node.body);
    const needsParens = isBlock || node.params.length !== 1;
    if (needsParens) {
      writer.append(text('('));
      ctx = walkArguments(ctx, writer, walk, node.params);
      writer.append(text(')'));
    }
    writer.append(space());
    writer.append(text('=>'));
    writer.append(space());
    ctx = walk(ctx, writer, node.body, walk);
    return ctx;
  }
);

registry.addWalker(
  node => t.isObjectExpression(node),
  (ctx: Context, writer: NodeWriter, node: AstNode, walk: Walker) => {
    writer.append(text('{'));
    ctx = walkDestructor(ctx, writer, walk, node.properties);
    writer.append(text('}'));
    return ctx;
  }
);

registry.addWalker(
  node => t.isMemberExpression(node),
  (ctx: Context, writer: NodeWriter, node: AstNode, walk: Walker) => {
    ctx = walk(ctx, writer, node.object, walk);
    writer.append(text('.'));
    ctx = walk(ctx, writer, node.propert, walk);
    return ctx;
  }
);

registry.addWalker(
  node => t.isLogicalExpression(node),
  (ctx: Context, writer: NodeWriter, node: AstNode, walk: Walker) => {
    ctx = walkBinaryOperator(
      ctx,
      writer,
      (ctx, writer) => walk(ctx, writer, node.left, walk),
      (ctx, writer) => { writer.append(text(node.operator)); return ctx; },
      (ctx, writer) => walk(ctx, writer, node.right, walk),
    );
    return ctx;
  }
);

registry.addWalker(
  node => t.isAssignmentExpression(node),
  (ctx: Context, writer: NodeWriter, node: AstNode, walk: Walker) => {
    ctx = walkBinaryOperator(
      ctx,
      writer,
      (ctx, writer) => walk(ctx, writer, node.left, walk),
      (ctx, writer) => { writer.append(text(node.operator)); return ctx; },
      (ctx, writer) => walk(ctx, writer, node.right, walk),
    );
    return ctx;
  }
);

registry.addWalker(
  node => t.isConditionalExpression(node),
  (ctx: Context, writer: NodeWriter, node: AstNode, walk: Walker) => {
    ctx = walk(ctx, writer, node.test, walk);
    writer.append(space());
    writer.append(text('?'));
    writer.append(space());
    ctx = walk(ctx, writer, node.consequent, walk);
    writer.append(space());
    writer.append(text(':'));
    writer.append(space());
    ctx = walk(ctx, writer, node.alternate, walk);
    return ctx;
  }
);