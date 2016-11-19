/* @flow */
/* eslint-disable no-param-reassign */
/* eslint-disable no-empty */
/* eslint-disable no-use-before-define */
/* eslint-disable no-shadow */

import type { Node as AstNode } from 'babylon';
import * as t from 'babel-types';

import type { NodeWriter } from './node';
import { Chunk } from './chunk';
import { Gate, LinkedGate } from './gate';
import { space, br, text } from './token';
import Context from './context';

import tokenize from './tokenize';
import solve from './solve';

function walkArguments(ctx: Context, chunk: NodeWriter, children: Array<AstNode>): Context {
  const gate = new LinkedGate();

  // Single line [a, b, c]
  gate.variant(ctx, (ctx, variant) => {
    for (const [index, child] of children.entries()) {
      ctx = walk(ctx, variant, child);
      if (index < children.length - 1) {
        variant.append(text(','));
        variant.append(space());
      }
    }
  });

  // Multi-line: [⏎»a,⏎»b,⏎»c,⏎]
  gate.variant(ctx, (ctx, variant) => {
    ctx = ctx.indent();
    for (const child of children) {
      variant.append(br(ctx));
      ctx = walk(ctx, variant, child);
      variant.append(text(','));
    }
    ctx = ctx.dedent();
    variant.append(br(ctx));
  });

  chunk.append(gate);
  return ctx;
}

function walkDeclarations(ctx: Context, chunk: NodeWriter, node: AstNode, children: Array<AstNode>): Context {
  const gate = new Gate();

  // Single line const a = 1, b = 2;
  gate.variant(ctx, (ctx, variant) => {
    variant.append(text(node.kind));
    variant.append(space());

    for (const [index, child] of children.entries()) {
      ctx = walk(ctx, variant, child);
      if (index < children.length - 1) {
        variant.append(text(','));
        variant.append(space());
      }
    }
    variant.append(text(';'));
  });

  // Multi-line: const a = 1,⏎»b = 2,⏎»c = 3;
  gate.variant(ctx, (ctx, variant) => {
    variant.append(text(node.kind));
    variant.append(space());

    ctx = ctx.indent();
    for (const [index, child] of children.entries()) {
      if (index > 0) {
        variant.append(text(','));
        variant.append(br(ctx));
      }
      ctx = walk(ctx, variant, child);
    }
    variant.append(text(';'));
    ctx = ctx.dedent();
  });

  // Really Multi-line: const⏎»a = 1,⏎»b = 2,⏎»c = 3;
  gate.variant(ctx, (ctx, variant) => {
    variant.append(text(node.kind));
    ctx = ctx.indent();
    for (const [index, child] of children.entries()) {
      if (index > 0) {
        variant.append(text(','));
      }
      variant.append(br(ctx));
      ctx = walk(ctx, variant, child);
    }
    variant.append(text(';'));
    ctx = ctx.dedent();
  });

  chunk.append(gate);
  return ctx;
}

function walk(ctx: Context, chunk: NodeWriter, node: AstNode): Context {
  if (t.isArrayExpression(node)) {
    chunk.append(text('['));
    ctx = walkArguments(ctx, chunk, node.elements);
    chunk.append(text(']'));
  } else if (t.isCallExpression(node)) {
    ctx = walk(ctx, chunk, node.callee);
    chunk.append(text('('));
    ctx = walkArguments(ctx, chunk, node.arguments);
    chunk.append(text(')'));
  } else if (t.isVariableDeclaration(node)) {
    ctx = walkDeclarations(ctx, chunk, node, node.declarations);
  } else if (t.isVariableDeclarator(node)) {
    ctx = walk(ctx, chunk, node.id);
    chunk.append(space());
    chunk.append(text('='));
    chunk.append(space());
    ctx = walk(ctx, chunk, node.init);
  } else if (t.isExpressionStatement(node)) {
    ctx = walk(ctx, chunk, node.expression);
  } else if (t.isIdentifier(node)) {
    chunk.append(text(node.name));
  } else if (t.isLiteral(node)) {
    chunk.append(text(node.extra.raw));
  } else {
    throw Error(`Walk Not Implemented: ${node.type}`);
  }
  return ctx;
}

export default function* (node: AstNode, limit: number): Iterable<string> {
  const root = new Chunk();
  walk(new Context(), root, node);
  const switches = solve(root, limit);
  yield* tokenize(root, switches);
}
