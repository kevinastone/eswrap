/* @flow */

import * as t from 'babel-types';
import type { AstNode } from '../ast';
import type { NodeWriter } from '../node';
import type { Walker } from '../registry';
import type { Context } from '../gate';
import registry from '../registry';
import { walkExpressions, walkBlock } from './walk';
import { space, br, nobr, text } from '../token';

registry.addWalker(
  node => t.isExpressionStatement(node),
  (ctx: Context, writer: NodeWriter, node: AstNode, walk: Walker) => {
    ctx = walk(ctx, writer, node.expression, walk);
    writer.append(nobr());
    writer.append(text(';'));
    writer.append(br());
    return ctx;
  }
);

registry.addWalker(
  node => t.isBlockStatement(node),
  (ctx: Context, writer: NodeWriter, node: AstNode, walk: Walker) => {
    writer.append(text('{'));
    if (node.body.length) {
      ctx = walkBlock(ctx, writer, (ctx, writer) => {
        for (const statement of node.body) {
          ctx = walk(ctx, writer, statement, walk);
        }
        return ctx;
      });
    }
    writer.append(text('}'));
    writer.append(br());
    return ctx;
  }
);

registry.addWalker(
  node => t.isReturnStatement(node),
  (ctx: Context, writer: NodeWriter, node: AstNode, walk: Walker) => {
    writer.append(text('return'));
    if (node.argument) {
      writer.append(space());
      ctx = walk(ctx, writer, node.argument, walk);
    }
    writer.append(nobr());
    writer.append(text(';'));
    writer.append(br());
    return ctx;
  }
);

registry.addWalker(
  node => t.isThrowStatement(node),
  (ctx: Context, writer: NodeWriter, node: AstNode, walk: Walker) => {
    writer.append(text('throw'));
    if (node.argument) {
      writer.append(space());
      ctx = walk(ctx, writer, node.argument, walk);
    }
    writer.append(nobr());
    writer.append(text(';'));
    writer.append(br());
    return ctx;
  }
);

registry.addWalker(
  node => t.isBreakStatement(node),
  (ctx: Context, writer: NodeWriter, _node: AstNode, _walk: Walker) => {
    writer.append(text('break'));
    writer.append(text(';'));
    writer.append(br());
    return ctx;
  }
);

registry.addWalker(
  node => t.isIfStatement(node),
  (ctx: Context, writer: NodeWriter, node: AstNode, walk: Walker) => {
    writer.append(text('if'));
    writer.append(space());
    writer.append(text('('));
    ctx = walkExpressions(ctx, writer, walk, (ctx, writer) =>
      walk(ctx, writer, node.test, walk)
    );
    writer.append(text(')'));
    writer.append(space());
    ctx = walk(ctx, writer, node.consequent, walk);
    if (node.alternate) {
      writer.append(nobr());
      writer.append(space());
      writer.append(text('else'));
      writer.append(space());
      ctx = walk(ctx, writer, node.alternate, walk);
    }
    return ctx;
  }
);

registry.addWalker(
  node => t.isWhileStatement(node),
  (ctx: Context, writer: NodeWriter, node: AstNode, walk: Walker) => {
    writer.append(text('while'));
    writer.append(space());
    writer.append(text('('));
    ctx = walkExpressions(ctx, writer, walk, (ctx, writer) =>
      walk(ctx, writer, node.test, walk)
    );
    writer.append(text(')'));
    writer.append(space());
    ctx = walk(ctx, writer, node.body, walk);
    return ctx;
  }
);

registry.addWalker(
  node => t.isForOfStatement(node),
  (ctx: Context, writer: NodeWriter, node: AstNode, walk: Walker) => {
    writer.append(text('for'));
    writer.append(space());
    writer.append(text('('));
    ctx = walkExpressions(ctx, writer, walk, (ctx, writer) => {
      node.left.loop = true;  // Hack: note for the variable declaration that it's in a loop
      ctx = walk(ctx, writer, node.left, walk);
      writer.append(space());
      writer.append(text('of'));
      writer.append(space());
      ctx = walk(ctx, writer, node.right, walk);
      return ctx;
    });
    writer.append(text(')'));
    writer.append(space());
    return walk(ctx, writer, node.body, walk);
  }
);

registry.addWalker(
  node => t.isForStatement(node),
  (ctx: Context, writer: NodeWriter, node: AstNode, walk: Walker) => {
    writer.append(text('for'));
    writer.append(space());
    writer.append(text('('));
    if (node.init) {
      node.init.loop = true;
      ctx = walk(ctx, writer, node.init, walk);
    }
    writer.append(text(';'));
    if (node.test) {
      writer.append(space());
      ctx = walk(ctx, writer, node.test, walk);
      writer.append(nobr());
    }
    writer.append(text(';'));
    if (node.update) {
      writer.append(space());
      ctx = walk(ctx, writer, node.update, walk);
    }
    writer.append(text(')'));
    writer.append(space());
    return walk(ctx, writer, node.body, walk);
  }
);

registry.addWalker(
  node => t.isTryStatement(node),
  (ctx: Context, writer: NodeWriter, node: AstNode, walk: Walker) => {
    writer.append(text('try'));
    writer.append(space());
    ctx = walk(ctx, writer, node.block, walk);
    if (node.handler) {
      writer.append(br());
      ctx = walk(ctx, writer, node.handler, walk);
    }
    if (node.finalizer) {
      writer.append(br());
      writer.append(text('finally'));
      writer.append(space());
      ctx = walk(ctx, writer, node.finalizer, walk);
    }
    return ctx;
  },
);

registry.addWalker(
  node => t.isCatchClause(node),
  (ctx: Context, writer: NodeWriter, node: AstNode, walk: Walker) => {
    writer.append(text('catch'));
    writer.append(space());
    writer.append(text('('));
    if (node.param) {
      ctx = walk(ctx, writer, node.param, walk);
    }
    writer.append(text(')'));
    writer.append(space());
    ctx = walk(ctx, writer, node.body, walk);
    return ctx;
  },
);

registry.addWalker(
  node => t.isEmptyStatement(node),
  (ctx: Context, _writer: NodeWriter, _node: AstNode, _walk: Walker) => ctx,
);
