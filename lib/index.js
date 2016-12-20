import type { Node as AstNode } from 'babylon';

import tokenize from './tokenize';
import transform from './transform';
import solve from './solve';


export default function* (node: AstNode, limit: number): Iterable<string> {
  const root = transform(node);
  const switches = solve(root, limit);
  yield* tokenize(root, switches);
}
