// @input
registry.addWalker(node => t.isExpressionStatement(node), (ctx, writer, node, walk) => {
  ctx = walk(ctx, writer, node.expression, walk);
  writer.append(text(';'));
  writer.append(br());
  return ctx;
});
// @expect length=80 skip
registry.addWalker(
  node => t.isExpressionStatement(node), (ctx, writer, node, walk) => {
    ctx = walk(ctx, writer, node.expression, walk);
    writer.append(text(';'));
    writer.append(br());
    return ctx;
  }
);
