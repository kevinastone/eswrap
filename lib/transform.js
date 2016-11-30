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

type AstVisitor = (ctx: Context, writer: NodeWriter) => Context;

function nodeLocation(node: AstNode): string {
  return `${node.loc.start.line}:${node.loc.start.column} - ${node.loc.end.line}:${node.loc.end.column}`;
}

function walkArguments(ctx: Context, writer: NodeWriter, children: Array<AstNode>): Context {
  const gate = new LinkedGate();

  // Single line [a, b, c]
  gate.variant(ctx, (ctx, writer) => {
    for (const [index, child] of children.entries()) {
      ctx = walk(ctx, writer, child);
      if (index < children.length - 1) {
        writer.append(text(','));
        writer.append(space());
      }
    }
  });

  // Multi-line: [⏎»a,⏎»b,⏎»c,⏎]
  gate.variant(ctx, (ctx, writer) => {
    ctx = ctx.indent();
    for (const child of children) {
      writer.append(br(ctx));
      ctx = walk(ctx, writer, child);
      writer.append(text(','));
    }
    ctx = ctx.dedent();
    writer.append(br(ctx));
  });

  writer.append(gate);
  return ctx;
}

function walkDestructor(ctx: Context, writer: NodeWriter, children: Array<AstNode>): Context {
  const gate = new LinkedGate();

  // Single line { a, b, c }
  gate.variant(ctx, (ctx, writer) => {
    writer.append(space());
    for (const [index, child] of children.entries()) {
      ctx = walk(ctx, writer, child);
      if (index < children.length - 1) {
        writer.append(text(','));
        writer.append(space());
      }
    }
    writer.append(space());
  });

  // Multi-line: {⏎»a,⏎»b,⏎»c,⏎}
  gate.variant(ctx, (ctx, writer) => {
    ctx = ctx.indent();
    for (const child of children) {
      writer.append(br(ctx));
      ctx = walk(ctx, writer, child);
      writer.append(text(','));
    }
    ctx = ctx.dedent();
    writer.append(br(ctx));
  });

  writer.append(gate);
  return ctx;
}

function walkPrefix(ctx: Context, writer: NodeWriter, lhs: AstVisitor, rhs: AstVisitor): Context {
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
    ctx = ctx.indent();
    writer.append(br(ctx));
    ctx = rhs(ctx, writer);
    ctx = ctx.dedent();
  });

  writer.append(gate);
  return ctx;
}

function walkBlock(ctx: Context, writer: NodeWriter, block: AstVisitor): Context {
  ctx = ctx.indent();
  writer.append(br(ctx));
  ctx = block(ctx, writer);
  ctx = ctx.dedent();
  writer.append(br(ctx));
  return ctx;
}

function walkDeclarations(ctx: Context, writer: NodeWriter, children: Array<AstNode>): Context {
  const gate = new Gate();

  // Single line const a = 1, b = 2;
  gate.variant(ctx, (ctx, writer) => {
    for (const [index, child] of children.entries()) {
      ctx = walk(ctx, writer, child);
      if (index < children.length - 1) {
        writer.append(text(','));
        writer.append(space());
      }
    }
  });

  // Multi-line: const a = 1,⏎»b = 2,⏎»c = 3;
  gate.variant(ctx, (ctx, writer) => {
    ctx = ctx.indent();
    for (const [index, child] of children.entries()) {
      if (index > 0) {
        writer.append(text(','));
        writer.append(br(ctx));
      }
      ctx = walk(ctx, writer, child);
    }
    ctx = ctx.dedent();
  });

  writer.append(gate);
  return ctx;
}

function walkComments(ctx: Context, writer: NodeWriter, node: AstNode): Context {
  if (node.type === 'CommentBlock') {
    writer.append(text('/*'));
    writer.append(text(node.value));
    writer.append(text('*/'));
    writer.append(br(ctx));
  } else {
    throw Error(`Walk Comments Not Implemented: ${node.type}`);
  }
  return ctx;
}

function walk(ctx: Context, writer: NodeWriter, node: AstNode): Context {
  if (node.leadingComments) {
    for (const comment of node.leadingComments) {
      ctx = walkComments(ctx, writer, comment);
    }
  }
  if (t.isProgram(node)) {
    for (const statement of node.body) {
      ctx = walk(ctx, writer, statement);
    }
  } else if (t.isArrayExpression(node)) {
    writer.append(text('['));
    ctx = walkArguments(ctx, writer, node.elements);
    writer.append(text(']'));
  } else if (t.isCallExpression(node)) {
    ctx = walk(ctx, writer, node.callee);
    writer.append(text('('));
    ctx = walkArguments(ctx, writer, node.arguments);
    writer.append(text(')'));
  } else if (t.isImportDeclaration(node)) {
    writer.append(text('import'));
    writer.append(space());
    const isDefault = t.isImportDefaultSpecifier(node.specifiers[0]);
    if (!isDefault) {
      writer.append(text('{'));
      ctx = walkDestructor(ctx, writer, node.specifiers);
      writer.append(text('}'));
    } else {
      ctx = walk(ctx, writer, node.specifiers[0]);
    }
    writer.append(space());
    writer.append(text('from'));
    writer.append(space());
    ctx = walk(ctx, writer, node.source);
    writer.append(text(';'));
    writer.append(br(ctx));
  } else if (t.isImportDefaultSpecifier(node)) {
    ctx = walk(ctx, writer, node.local);
  } else if (t.isImportSpecifier(node)) {
    if (node.imported.name !== node.local.name) {
      ctx = walk(ctx, writer, node.imported);
      writer.append(space());
      writer.append(text('as'));
      writer.append(space());
      ctx = walk(ctx, writer, node.local);
    } else {
      ctx = walk(ctx, writer, node.imported);
    }
  } else if (t.isExportDefaultDeclaration(node)) {
    writer.append(text('export'));
    writer.append(space());
    writer.append(text('default'));
    writer.append(space());
    ctx = walk(ctx, writer, node.declaration);
    writer.append(text(';'));
    writer.append(br(ctx));
  } else if (t.isVariableDeclaration(node)) {
    ctx = walkPrefix(
      ctx,
      writer,
      (ctx, writer) => { writer.append(text(node.kind)); return ctx; },
      (ctx, writer) => walkDeclarations(ctx, writer, node.declarations),
    );
    writer.append(text(';'));
    writer.append(br(ctx));
  } else if (t.isFunctionDeclaration(node)) {
    writer.append(text('function'));
    if (node.id) {
      writer.append(space());
      writer.append(text(node.id));
    }
    writer.append(text('('));
    ctx = walkArguments(ctx, writer, node.params);
    writer.append(text(')'));
    writer.append(space());
    ctx = walk(ctx, writer, node.body);
  } else if (t.isVariableDeclarator(node)) {
    ctx = walk(ctx, writer, node.id);
    writer.append(space());
    writer.append(text('='));
    writer.append(space());
    ctx = walk(ctx, writer, node.init);
  } else if (t.isExpressionStatement(node)) {
    ctx = walk(ctx, writer, node.expression);
  } else if (t.isBlockStatement(node)) {
    writer.append(text('{'));
    if (node.body.length) {
      ctx = walkBlock(ctx, writer, (ctx, writer) => {
        for (const statement of node.body) {
          ctx = walk(ctx, writer, statement);
        }
        return ctx;
      });
    }
    writer.append(text('}'));
  } else if (t.isReturnStatement(node)) {
    writer.append(text('return'));
    writer.append(space());
    ctx = walk(ctx, writer, node.argument);
    writer.append(text(';'));
  } else if (t.isEmptyStatement(node)) {
    // Do nothing;
  } else if (t.isArrowFunctionExpression(node)) {
    const isBlock = t.isBlockStatement(node.body);
    const needsParens = isBlock || node.params.length !== 1;
    if (needsParens) {
      writer.append(text('('));
      ctx = walkArguments(ctx, writer, node.params);
      writer.append(text(')'));
    }
    writer.append(space());
    writer.append(text('=>'));
    writer.append(space());
    ctx = walk(ctx, writer, node.body);
  } else if (t.isObjectExpression(node)) {
    writer.append(text('{'));
    ctx = walkDestructor(ctx, writer, node.properties);
    writer.append(text('}'));
  } else if (t.isMemberExpression(node)) {
    ctx = walk(ctx, writer, node.object);
    writer.append(text('.'));
    ctx = walk(ctx, writer, node.property);
  } else if (t.isObjectProperty(node)) {
    ctx = walk(ctx, writer, node.key);
    writer.append(text(':'));
    writer.append(space());
    ctx = walk(ctx, writer, node.value);
  } else if (t.isIdentifier(node)) {
    writer.append(text(node.name));
  } else if (t.isLiteral(node)) {
    writer.append(text(node.extra.raw));
  } else {
    throw Error(`Walk Not Implemented: ${node.type} at ${nodeLocation(node)}`);
  }
  return ctx;
}

export default function* (node: AstNode, limit: number): Iterable<string> {
  const root = new Chunk();
  walk(new Context(), root, node);
  const switches = solve(root, limit);
  yield* tokenize(root, switches);
}
