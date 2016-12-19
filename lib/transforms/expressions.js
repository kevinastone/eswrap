/* @flow */

import type { Node as AstNode } from 'babylon';
import * as t from 'babel-types';
import type { NodeWriter } from '../node';
import type { Walker } from '../registry';
import type { Context } from '../gate';
import registry from '../registry';
import { walkArguments, walkBinaryOperator, walkDestructor, walkConnectingOperator } from '../walk';
import { walkFunctionArguments } from './functions';
import { space, nobr, text } from '../token';

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
    ctx = walkBinaryOperator(
      ctx,
      writer,
      (ctx, writer) => {
        const isBlock = t.isBlockStatement(node.body);
        const needsParens = isBlock || node.params.length !== 1;
        if (needsParens) {
          writer.append(text('('));
          ctx = walkArguments(ctx, writer, walk, node.params);
          writer.append(text(')'));
        } else {
          ctx = walk(ctx, writer, node.params[0], walk);
        }
        return ctx;
      },
      (ctx, writer) => { writer.append(text('=>')); return ctx; },
      (ctx, writer) => walk(ctx, writer, node.body, walk),
    );
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
  node => t.isFunctionExpression(node),
  (ctx: Context, writer: NodeWriter, node: AstNode, walk: Walker) => {
    writer.append(text('function'));
    if (node.generator) {
      writer.append(text('*'));
    }
    if (node.id) {
      writer.append(space());
      ctx = walk(ctx, writer, node.id, walk);
    }
    ctx = walkFunctionArguments(ctx, writer, node, walk);
    writer.append(nobr());
    return ctx;
  }
);

registry.addWalker(
  node => t.isMemberExpression(node),
  (ctx: Context, writer: NodeWriter, node: AstNode, walk: Walker) => {
    ctx = walkConnectingOperator(
      ctx,
      writer,
      (ctx, writer) => walk(ctx, writer, node.object, walk),
      (ctx, writer) => { writer.append(text('.')); return ctx; },
      (ctx, writer) => walk(ctx, writer, node.property, walk),
    );
    return ctx;
  }
);

registry.addWalker(
  node => t.isThisExpression(node),
  (ctx: Context, writer: NodeWriter, _node: AstNode, _walk: Walker) => {
    writer.append(text('this'));
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
  node => t.isBinaryExpression(node),
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

registry.addWalker(
  node => t.isNewExpression(node),
  (ctx: Context, writer: NodeWriter, node: AstNode, walk: Walker) => {
    writer.append(text('new'));
    writer.append(space());
    ctx = walk(ctx, writer, node.callee, walk);
    writer.append(text('('));
    ctx = walkArguments(ctx, writer, walk, node.arguments);
    writer.append(text(')'));
    return ctx;
  }
);

registry.addWalker(
  node => t.isYieldExpression(node),
  (ctx: Context, writer: NodeWriter, node: AstNode, walk: Walker) => {
    writer.append(text('yield'));
    writer.append(space());
    ctx = walk(ctx, writer, node.argument, walk);
    return ctx;
  }
);

const OPERATORS_WITH_SPACE = new Set(['delete', 'typeof', 'void']);
registry.addWalker(
  node => t.isUnaryExpression(node),
  (ctx: Context, writer: NodeWriter, node: AstNode, walk: Walker) => {
    writer.append(text(node.operator));
    if (OPERATORS_WITH_SPACE.has(node.operator)) {
      writer.append(space());
    }
    ctx = walk(ctx, writer, node.argument, walk);
    return ctx;
  }
);

registry.addWalker(
  node => t.isUpdateExpression(node),
  (ctx: Context, writer: NodeWriter, node: AstNode, walk: Walker) => {
    if (node.prefix) {
      writer.append(text(node.operator));
    }
    ctx = walk(ctx, writer, node.argument, walk);
    if (!node.prefix) {
      writer.append(text(node.operator));
    }
    return ctx;
  }
);

registry.addWalker(
  node => t.isClassExpression(node),
  (ctx: Context, writer: NodeWriter, node: AstNode, walk: Walker) => {
    writer.append(text('class'));
    if (node.id) {
      writer.append(space());
      ctx = walk(ctx, writer, node.id, walk);
    }
    if (node.superClass) {
      writer.append(space());
      writer.append(text('extends'));
      writer.append(space());
      ctx = walk(ctx, writer, node.superClass, walk);
    }
    writer.append(space());
    ctx = walk(ctx, writer, node.body, walk);
    return ctx;
  }
);

registry.addWalker(
  node => t.isAssignmentPattern(node),
  (ctx: Context, writer: NodeWriter, node: AstNode, walk: Walker) => {
    ctx = walk(ctx, writer, node.left, walk);
    writer.append(space());
    writer.append(text('='));
    writer.append(space());
    ctx = walk(ctx, writer, node.right, walk);
    return ctx;
  }
);

registry.addWalker(
  node => t.isArrayPattern(node),
  (ctx: Context, writer: NodeWriter, node: AstNode, walk: Walker) => {
    writer.append(text('['));
    ctx = walkArguments(ctx, writer, walk, node.elements);
    writer.append(text(']'));
    return ctx;
  }
);

registry.addWalker(
  node => t.isObjectPattern(node),
  (ctx: Context, writer: NodeWriter, node: AstNode, walk: Walker) => {
    writer.append(text('{'));
    writer.append(space());
    ctx = walkArguments(ctx, writer, walk, node.properties);
    writer.append(space());
    writer.append(text('}'));
    return ctx;
  }
);

registry.addWalker(
  node => t.isRestElement(node),
  (ctx: Context, writer: NodeWriter, node: AstNode, walk: Walker) => {
    writer.append(text('...'));
    return walk(ctx, writer, node.argument, walk);
  }
);

registry.addWalker(
  node => t.isSpreadElement(node),
  (ctx: Context, writer: NodeWriter, node: AstNode, walk: Walker) => {
    writer.append(text('...'));
    return walk(ctx, writer, node.argument, walk);
  }
);
