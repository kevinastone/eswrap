/* @flow */

import type { Node, Switches } from './node';

export default function* (node: Node, switches: Switches): Iterable<string> {
  for (const token of node.tokens(switches)) {
    yield token.text;
  }
}
