/* @flow */

import type { Node, Switches } from './node';
import { Token, Formatter } from './token';

function* walk(node: Node, switches: Switches): Iterable<Token> {
  for (const token of node.tokens(switches)) {
    yield token;
  }
  for (const child of node.children(switches)) {
    yield* walk(child, switches);
  }
}

function* tokenize(formatter: Formatter, node: Node, switches: Switches): Iterable<string> {
  for (const token of walk(node, switches)) {
    // console.log(token.constructor.name);
    for (const str of token.text(formatter)) {
      // console.log('"', str, '"');
      yield str;
    }
    // yield* token.text(formatter);
  }
}

export default function* (node: Node, switches: Switches): Iterable<string> {
  const formatter = new Formatter();
  yield* tokenize(formatter, node, switches);
}
