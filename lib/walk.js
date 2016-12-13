/* @flow */

import type { Node as AstNode } from 'babylon';

import type { NodeWriter } from './node';
import { Gate, LinkedGate, ChainedGate } from './gate';
import { indent, dedent, space, br, text } from './token';
import Context from './context';
import type { Walker } from './registry';

type CurriedWalker = (ctx: Context, writer: NodeWriter) => Context;

export function walkArguments(ctx: Context, writer: NodeWriter, walk: Walker, children: Array<AstNode>): Context {
  const gate = new LinkedGate();

  // Single line [a, b, c]
  gate.variant(ctx, (ctx, writer) => {
    for (const [index, child] of children.entries()) {
      ctx = walk(ctx, writer, child, walk);
      if (index < children.length - 1) {
        writer.append(text(','));
        writer.append(space());
      }
    }
  });

  // Multi-line: [⏎»a,⏎»b,⏎»c,⏎]
  if (children.length) {
    gate.variant(ctx, (ctx, writer) => {
      writer.append(indent());
      for (const child of children) {
        writer.append(br());
        ctx = walk(ctx, writer, child, walk);
        writer.append(text(','));
      }
      writer.append(dedent());
      writer.append(br());
    });
  }

  writer.append(gate);
  return ctx;
}

export function walkExpressions(ctx: Context, writer: NodeWriter, walk: Walker, inner: CurriedWalker): Context {
  const gate = new LinkedGate();

  // Single line (a b c)
  gate.variant(ctx, (ctx, writer) => {
    ctx = inner(ctx, writer);
  });

  // Multi-line: (⏎»a⏎»b⏎»c⏎)
  gate.variant(ctx, (ctx, writer) => {
    writer.append(br());
    writer.append(indent());
    ctx = inner(ctx, writer);
    writer.append(dedent());
    writer.append(br());
  });

  writer.append(gate);
  return ctx;
}

export function walkDestructor(ctx: Context, writer: NodeWriter, walk: Walker, children: Array<AstNode>): Context {
  const gate = new LinkedGate();

  // Single line { a, b, c }
  gate.variant(ctx, (ctx, writer) => {
    writer.append(space());
    for (const [index, child] of children.entries()) {
      ctx = walk(ctx, writer, child, walk);
      if (index < children.length - 1) {
        writer.append(text(','));
        writer.append(space());
      }
    }
    writer.append(space());
  });

  // Multi-line: {⏎»a,⏎»b,⏎»c,⏎}
  gate.variant(ctx, (ctx, writer) => {
    writer.append(indent());
    for (const child of children) {
      writer.append(br());
      ctx = walk(ctx, writer, child, walk);
      writer.append(text(','));
    }
    writer.append(dedent());
    writer.append(br());
  });

  writer.append(gate);
  return ctx;
}

export function walkBinaryOperator(ctx: Context, writer: NodeWriter, lhs: CurriedWalker, op: CurriedWalker, rhs: CurriedWalker): Context {
  const gate = new ChainedGate();

  // Single line lhs op rhs;
  gate.variant(ctx, (ctx, writer) => {
    ctx = lhs(ctx, writer);
    writer.append(space());
    ctx = op(ctx, writer);
    writer.append(space());
    ctx = rhs(ctx, writer);
  });

  // Multi-line: lhs op⏎»rhs;
  gate.variant(ctx, (ctx, writer) => {
    ctx = lhs(ctx, writer);
    writer.append(space());
    ctx = op(ctx, writer);
    writer.append(br());
    writer.append(indent());
    ctx = rhs(ctx, writer);
    writer.append(dedent());
  });

  writer.append(gate);
  return ctx;
}

export function walkPrefix(ctx: Context, writer: NodeWriter, lhs: CurriedWalker, rhs: CurriedWalker): Context {
  const gate = new Gate();

  // Single line lhs rhs;
  gate.variant(ctx, (ctx, writer) => {
    ctx = lhs(ctx, writer);
    writer.append(space());
    ctx = rhs(ctx, writer);
  });

  // Multi-line: lhs⏎»rhs;
  gate.variant(ctx, (ctx, writer) => {
    ctx = lhs(ctx, writer);
    writer.append(br());
    writer.append(indent());
    ctx = rhs(ctx, writer);
    writer.append(dedent());
  });

  writer.append(gate);
  return ctx;
}

export function walkBlock(ctx: Context, writer: NodeWriter, block: CurriedWalker): Context {
  writer.append(br());
  writer.append(indent());
  ctx = block(ctx, writer);
  writer.append(dedent());
  writer.append(br());
  return ctx;
}

export function walkDeclarations(ctx: Context, writer: NodeWriter, walk: Walker, children: Array<AstNode>): Context {
  const gate = new Gate();

  // Single line const a = 1, b = 2;
  gate.variant(ctx, (ctx, writer) => {
    for (const [index, child] of children.entries()) {
      ctx = walk(ctx, writer, child, walk);
      if (index < children.length - 1) {
        writer.append(text(','));
        writer.append(space());
      }
    }
  });

  // Multi-line: const a = 1,⏎»b = 2,⏎»c = 3;
  gate.variant(ctx, (ctx, writer) => {
    writer.append(indent());
    for (const [index, child] of children.entries()) {
      if (index > 0) {
        writer.append(text(','));
        writer.append(br());
      }
      ctx = walk(ctx, writer, child, walk);
    }
    writer.append(dedent());
  });

  writer.append(gate);
  return ctx;
}

export function walkComments(ctx: Context, writer: NodeWriter, node: AstNode): Context {
  if (node.type === 'CommentBlock') {
    writer.append(text('/*'));
    writer.append(text(node.value));
    writer.append(text('*/'));
    writer.append(br());
  } else if (node.type === 'CommentLine') {
    writer.append(text('//'));
    writer.append(text(node.value));
    writer.append(br());
  } else {
    throw Error(`Walk Comments Not Implemented: ${node.type}`);
  }
  return ctx;
}
