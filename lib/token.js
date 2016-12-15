/* @flow */

import { List } from 'immutable';
import type { Context } from './tokenize';
import type { Node, Switches } from './node';

export class Token {
  tokens(): List<Token> {
    return List.of(this);
  }

  children(_switches: Switches): List<Node> {
    return List();
  }
}

class Content extends Token {
  _text: string;

  constructor(text: string) {
    super();
    this._text = text;
  }

  * text(ctx: Context): Iterable<string> {
    yield* ctx.yield(this._text);
  }
}

class Formatter extends Token {

  format(_ctx: Context): void {}

  // eslint-disable-next-line
  * text(ctx: Context): Iterable<string> {
    this.format(ctx);
  }
}

class BreakToken extends Formatter {

  format(ctx: Context): void {
    ctx.newline();
  }
}

class IndentToken extends Formatter {
  format(ctx: Context): void {
    ctx.indent();
  }
}

class DedentToken extends Formatter {
  format(ctx: Context): void {
    ctx.dedent();
  }
}

export function indent(): Token {
  return new IndentToken();
}

export function dedent(): Token {
  return new DedentToken();
}

export function space(): Token {
  return new Content(' ');
}

export function br(): Token {
  return new BreakToken();
}

export function eos(): Token {
  return new BreakToken();
}

export function text(text: string): Token {
  return new Content(text);
}
