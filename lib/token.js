/* @flow */

/* eslint-disable no-shadow */

import { List } from 'immutable';
import type Context from './context';
import type { Node, Switches, Variant } from './node';

export class Token {
  text: string;

  constructor(text: string) {
    this.text = text;
  }

  tokens(_switches: Switches): List<Token> {
    return List.of(this);
  }

  children(_variant: Variant): List<Node> {
    return List();
  }
}


export function space(): Token {
  return new Token(' ');
}

export function br(ctx: Context): Token {
  return new Token(`\n${' '.repeat(ctx.indentation.amount)}`);
}

export function text(text: string): Token {
  return new Token(text);
}
