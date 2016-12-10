/* @flow */

import { List } from 'immutable';
import type { Context } from './tokenize';
import type { Node, Switches } from './node';

export class Token {
  _text: string;

  constructor(text: string) {
    this._text = text;
  }

  tokens(): List<Token> {
    return List.of(this);
  }

  children(_switches: Switches): List<Node> {
    return List();
  }

  * text(ctx: Context): Iterable<string> {
    yield* ctx.yield(this._text);
  }
}

class BreakToken extends Token {
  constructor() {
    super('');
  }

  * text(ctx: Context): Iterable<string> {
    yield* super.text(ctx);
    ctx.newline();
  }
}

class IndentToken extends Token {
  constructor() {
    super('');
  }

  * text(ctx: Context): Iterable<string> {
    ctx.indent();
    yield* super.text(ctx);
  }
}

class DedentToken extends Token {
  constructor() {
    super('');
  }

  * text(ctx: Context): Iterable<string> {
    ctx.dedent();
    yield* super.text(ctx);
  }
}

export function indent(): Token {
  return new IndentToken();
}

export function dedent(): Token {
  return new DedentToken();
}

export function space(): Token {
  return new Token(' ');
}

export function br(): Token {
  return new BreakToken();
}

export function text(text: string): Token {
  return new Token(text);
}
