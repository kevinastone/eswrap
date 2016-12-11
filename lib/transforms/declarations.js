/* @flow */

import type { Node as AstNode } from 'babylon';
import * as t from 'babel-types';
import type { NodeWriter } from '../node';
import type { Walker } from '../registry';
import type Context from '../context';
import registry from '../registry';
import { walkDestructor, walkDeclarations, walkArguments } from '../walk';
import { space, br, text } from '../token';

registry.addWalker(
  node => t.isImportDeclaration(node),
  (ctx: Context, writer: NodeWriter, node: AstNode, walk: Walker) => {
    writer.append(text('import'));
    writer.append(space());
    if (node.specifiers.length) {
      // 1. namespace 2. default 3. remaining

      let isFirst = true;
      const namespaces = node.specifiers.filter(node => t.isImportNamespaceSpecifier(node));
      const defaults = node.specifiers.filter(node => t.isImportDefaultSpecifier(node));
      const specifiers = node.specifiers.filter(node => t.isImportSpecifier(node));

      for (const child of namespaces) {
        if (!isFirst) {
          writer.append(text(','));
          writer.append(space());
        } else {
          isFirst = false;
        }
        ctx = walk(ctx, writer, child, walk);
      }

      for (const child of defaults) {
        if (!isFirst) {
          writer.append(text(','));
          writer.append(space());
        } else {
          isFirst = false;
        }
        ctx = walk(ctx, writer, child, walk);
      }

      if (specifiers.length) {
        if (!isFirst) {
          writer.append(text(','));
          writer.append(space());
        } else {
          isFirst = false;
        }
        writer.append(text('{'));
        ctx = walkDestructor(ctx, writer, walk, specifiers);
        writer.append(text('}'));
      }

      writer.append(space());
      writer.append(text('from'));
      writer.append(space());
    }
    ctx = walk(ctx, writer, node.source, walk);
    writer.append(text(';'));
    writer.append(br());
    return ctx;
  }
);

registry.addWalker(
  node => t.isExportDeclaration(node),
  (ctx: Context, writer: NodeWriter, node: AstNode, walk: Walker) => {
    writer.append(text('export'));
    writer.append(space());
    writer.append(text('default'));
    writer.append(space());
    ctx = walk(ctx, writer, node.declaration, walk);
    writer.append(text(';'));
    writer.append(br());
    return ctx;
  }
);

registry.addWalker(
  node => t.isVariableDeclaration(node),
  (ctx: Context, writer: NodeWriter, node: AstNode, walk: Walker) => {
    writer.append(text(node.kind));
    writer.append(space());
    ctx = walkDeclarations(ctx, writer, walk, node.declarations);
    writer.append(text(';'));
    writer.append(br());
    return ctx;
  }
);

registry.addWalker(
  node => t.isFunctionDeclaration(node),
  (ctx: Context, writer: NodeWriter, node: AstNode, walk: Walker) => {
    writer.append(text('function'));
    if (node.generator) {
      writer.append(text('*'));
    }
    if (node.id) {
      writer.append(space());
      ctx = walk(ctx, writer, node.id, walk);
    }
    writer.append(text('('));
    ctx = walkArguments(ctx, writer, walk, node.params);
    writer.append(text(')'));
    writer.append(space());
    ctx = walk(ctx, writer, node.body, walk);
    return ctx;
  }
);

registry.addWalker(
  node => t.isImportNamespaceSpecifier(node),
  (ctx: Context, writer: NodeWriter, node: AstNode, walk: Walker) => {
    writer.append(text('*'));
    writer.append(space());
    writer.append(text('as'));
    writer.append(space());
    ctx = walk(ctx, writer, node.local, walk);
    return ctx;
  }
);

registry.addWalker(
  node => t.isImportDefaultSpecifier(node),
  (ctx: Context, writer: NodeWriter, node: AstNode, walk: Walker) =>
    walk(ctx, writer, node.local, walk)
);

registry.addWalker(
  node => t.isImportSpecifier(node),
  (ctx: Context, writer: NodeWriter, node: AstNode, walk: Walker) => {
    if (node.imported.name !== node.local.name) {
      ctx = walk(ctx, writer, node.imported, walk);
      writer.append(space());
      writer.append(text('as'));
      writer.append(space());
      ctx = walk(ctx, writer, node.local, walk);
    } else {
      ctx = walk(ctx, writer, node.imported, walk);
    }
    return ctx;
  }
);

registry.addWalker(
  node => t.isVariableDeclarator(node),
  (ctx: Context, writer: NodeWriter, node: AstNode, walk: Walker) => {
    ctx = walk(ctx, writer, node.id, walk);
    if (node.init) {
      writer.append(space());
      writer.append(text('='));
      writer.append(space());
      ctx = walk(ctx, writer, node.init, walk);
    }
    return ctx;
  }
);
