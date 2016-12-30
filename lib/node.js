/* @flow */

import { List, Map as ImmMap } from 'immutable';
import { Token } from './token';

export type GateID = number;
export type VariantID = number;
export type Switches = ImmMap<GateID, VariantID>;

export type Visitor = (node: Node) => void;

export interface Node {
  children(switches: Switches): List<Node>;
  tokens(): List<Token>;
}

export interface NodeWriter {
  append(node: Node): NodeWriter;
}
