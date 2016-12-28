import type { AstNode } from '../ast';
import type { NodeWriter } from '../node';
import type { Walker } from '../registry';
import type { Context } from '../gate';
import { Gate } from '../gate';
import { space, text, br, indent, dedent } from '../token';
import { walkArguments } from './walk';

export function walkFunctionArguments(ctx: Context, writer: NodeWriter, node: AstNode, walk: Walker): Context {
  writer.append(text('('));
  ctx = walkArguments(ctx, writer, walk, node.params);
  writer.append(text(')'));
  if (node.returnType) {
    const gate = new Gate();

    gate.variant(ctx, (ctx, writer) =>
      walk(ctx, writer, node.returnType, walk)
    );

    gate.variant(ctx, (ctx, writer) => {
      writer.append(br());
      writer.append(indent());
      ctx = walk(ctx, writer, node.returnType, walk);
      writer.append(dedent());
      return ctx;
    });

    writer.append(gate);
  }
  writer.append(space());
  ctx = walk(ctx, writer, node.body, walk);
  return ctx;
}
