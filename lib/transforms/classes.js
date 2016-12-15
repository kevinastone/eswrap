/* @flow */

import type { Node as AstNode } from 'babylon';
import * as t from 'babel-types';
import type { NodeWriter } from '../node';
import type { Walker } from '../registry';
import type Context from '../context';
import registry from '../registry';
import { space, br, nobr, text } from '../token';
import { walkBinaryOperator, walkBlock } from '../walk';
import { walkFunctionArguments } from './functions';

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
  node => t.isClassDeclaration(node),
  (ctx: Context, writer: NodeWriter, node: AstNode, walk: Walker) => {
    writer.append(text('class'));
    writer.append(space());
    ctx = walk(ctx, writer, node.id, walk);
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
  node => t.isClassBody(node),
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
  node => t.isClassProperty(node),
  (ctx: Context, writer: NodeWriter, node: AstNode, walk: Walker) => {
    if (node.value) {
      ctx = walkBinaryOperator(
        ctx,
        writer,
        (ctx, writer) => walk(ctx, writer, node.key, walk),
        (ctx, writer) => { writer.append(text('=')); return ctx; },
        (ctx, writer) => walk(ctx, writer, node.value, walk),
      );
    } else {
      ctx = walk(ctx, writer, node.key, walk);
    }
    writer.append(nobr());
    writer.append(text(';'));
    writer.append(br());
    return ctx;
  }
);

registry.addWalker(
  node => t.isClassMethod(node),
  (ctx: Context, writer: NodeWriter, node: AstNode, walk: Walker) => {
    if (node.kind === 'get' || node.kind === 'set') {
      writer.append(text(node.kind));
      writer.append(space());
    }
    if (node.generator) {
      writer.append(text('*'));
    }
    if (node.key) {
      ctx = walk(ctx, writer, node.key, walk);
    }
    return walkFunctionArguments(ctx, writer, node, walk);
  }
);

registry.addWalker(
  node => t.isSuper(node),
  (ctx: Context, writer: NodeWriter, _node: AstNode, _walk: Walker) => {
    writer.append(text('super'));
    return ctx;
  }
);
