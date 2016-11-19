/* @flow */

import { List, Map } from 'immutable';
import { Token } from './token';

export type GateID = number;
export type Variant = number;
export type Switches = Map<GateID, Variant>;

export type Visitor = (node: Node) => void;

export interface Node {
  children(variant: Variant): List<Node>;
  tokens(switches: Switches): List<Token>;
}

export interface NodeWriter {
  append(node: Node): NodeWriter;
}
