import type { Node as AstNode } from 'babylon';
import type { NodeWriter } from '../node';
import type { Walker } from '../registry';
import type { Context } from '../gate';
import { space, text } from '../token';
import { walkArguments } from './walk';

export function walkFunctionArguments(ctx: Context, writer: NodeWriter, node: AstNode, walk: Walker): Context {
  writer.append(text('('));
  ctx = walkArguments(ctx, writer, walk, node.params);
  writer.append(text(')'));
  writer.append(space());
  ctx = walk(ctx, writer, node.body, walk);
  return ctx;
}
