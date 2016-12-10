/* @flow */

import { List } from 'immutable';

import type { Node, NodeWriter, Switches } from './node';
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

  tokens(): List<Token> {
    return List();
  }

  children(_switches: Switches): List<Node> {
    return this.nodes;
  }
}
