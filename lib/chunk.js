/* @flow */

import { List } from 'immutable';

import type { Node, NodeWriter, Switches, Variant } from './node';
import { Token } from './token';

export class Chunk {
  nodes: List<Node>;

  constructor() {
    this.nodes = List();
  }

  append(node: Node): NodeWriter {
    this.nodes = this.nodes.push(node);
    return this;
  }

  tokens(switches: Switches): List<Token> {
    return this.nodes.flatMap(n => n.tokens(switches));
  }

  children(_variant: Variant): List<Node> {
    return this.nodes;
  }
}
