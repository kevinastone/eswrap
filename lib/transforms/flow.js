/* @flow */

import type { Node as AstNode } from 'babylon';
import * as t from 'babel-types';
import type { NodeWriter } from '../node';
import type { Walker } from '../registry';
import type Context from '../context';
import registry from '../registry';
import { walkArguments, walkBinaryOperator, walkBlock } from '../walk';
import { space, text } from '../token';

registry.addWalker(
  node => t.isTypeAlias(node),
  (ctx: Context, writer: NodeWriter, node: AstNode, walk: Walker) => {
    writer.append(text('type'));
    writer.append(space());
    ctx = walkBinaryOperator(
      ctx,
      writer,
      (ctx, writer) => {
        ctx = walk(ctx, writer, node.id, walk);
        if (node.typeParameters) {
          ctx = ctx = walk(ctx, writer, node.typeParameters, walk);
        }
        return ctx;
      },
      (ctx, writer) => { writer.append(text('=')); return ctx; },
      (ctx, writer) => walk(ctx, writer, node.right, walk),
    );
    writer.append(text(';'));
    return ctx;
  }
);

registry.addWalker(
  node => t.isNumberTypeAnnotation(node),
  (ctx: Context, writer: NodeWriter, _node: AstNode, _walk: Walker) => {
    writer.append(text('number'));
    return ctx;
  }
);

registry.addWalker(
  node => t.isBooleanTypeAnnotation(node),
  (ctx: Context, writer: NodeWriter, _node: AstNode, _walk: Walker) => {
    writer.append(text('boolean'));
    return ctx;
  }
);

registry.addWalker(
  node => t.isVoidTypeAnnotation(node),
  (ctx: Context, writer: NodeWriter, _node: AstNode, _walk: Walker) => {
    writer.append(text('void'));
    return ctx;
  }
);

registry.addWalker(
  node => t.isTupleTypeAnnotation(node),
  (ctx: Context, writer: NodeWriter, node: AstNode, walk: Walker) => {
    writer.append(text('['));
    ctx = walkArguments(ctx, writer, walk, node.types);
    writer.append(text(']'));
    return ctx;
  }
);

registry.addWalker(
  node => t.isGenericTypeAnnotation(node),
  (ctx: Context, writer: NodeWriter, node: AstNode, walk: Walker) => {
    ctx = walk(ctx, writer, node.id, walk);
    if (node.typeParameters) {
      ctx = ctx = walk(ctx, writer, node.typeParameters, walk);
    }
    return ctx;
  }
);

registry.addWalker(
  node => t.isTypeParameterDeclaration(node),
  (ctx: Context, writer: NodeWriter, node: AstNode, walk: Walker) => {
    writer.append(text('<'));
    ctx = walkArguments(ctx, writer, walk, node.params);
    writer.append(text('>'));
    return ctx;
  }
);

registry.addWalker(
  node => t.isTypeParameterInstantiation(node),
  (ctx: Context, writer: NodeWriter, node: AstNode, walk: Walker) => {
    writer.append(text('<'));
    ctx = walkArguments(ctx, writer, walk, node.params);
    writer.append(text('>'));
    return ctx;
  }
);

registry.addWalker(
  node => t.isTypeParameter(node),
  (ctx: Context, writer: NodeWriter, node: AstNode, _walk: Walker) => {
    writer.append(text(node.name));
    return ctx;
  }
);

registry.addWalker(
  node => t.isFunctionTypeParam(node),
  (ctx: Context, writer: NodeWriter, node: AstNode, walk: Walker) => {
    ctx = walk(ctx, writer, node.name, walk);
    writer.append(text(':'));
    writer.append(space());
    ctx = walk(ctx, writer, node.typeAnnotation, walk);
    return ctx;
  }
);

registry.addWalker(
  node => t.isFunctionTypeAnnotation(node),
  (ctx: Context, writer: NodeWriter, node: AstNode, walk: Walker) => {
    ctx = walkBinaryOperator(
      ctx,
      writer,
      (ctx, writer) => {
        writer.append(text('('));
        ctx = walkArguments(ctx, writer, walk, node.params);
        writer.append(text(')'));
        return ctx;
      },
      (ctx, writer) => { writer.append(text('=>')); return ctx; },
      (ctx, writer) => walk(ctx, writer, node.returnType, walk),
    );
    return ctx;
  }
);

registry.addWalker(
  node => t.isInterfaceDeclaration(node),
  (ctx: Context, writer: NodeWriter, node: AstNode, walk: Walker) => {
    writer.append(text('interface'));
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
  node => t.isObjectTypeAnnotation(node),
  (ctx: Context, writer: NodeWriter, node: AstNode, walk: Walker) => {
    writer.append(text('{'));
    if (node.properties.length) {
      ctx = walkBlock(ctx, writer, (ctx, writer) => {
        for (const statement of node.properties) {
          ctx = walk(ctx, writer, statement, walk);
        }
        return ctx;
      });
    }
    writer.append(text('}'));
    return ctx;
  }
);

registry.addWalker(
  node => t.isObjectTypeProperty(node),
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
    if (node.value) {
      ctx = walk(ctx, writer, node.value, walk);
    }
    return ctx;
  }
);
