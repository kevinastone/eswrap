/* @flow */

import { List } from 'immutable';
import type { Node, Switches } from './node';
import Formatter from './formatter';

export class Token {
  tokens(): List<Token> {
    return List.of(this);
  }

  children(_switches: Switches): List<Node> {
    return List();
  }

  // eslint-disable-next-line
  * text(formatter: Formatter): Iterable<string> {}
}

class Content extends Token {
  _text: string;

  constructor(text: string) {
    super();
    this._text = text;
  }

  * text(formatter: Formatter): Iterable<string> {
    yield* formatter.formating();
    yield this._text;
  }
}

class Space extends Content {
  constructor() {
    super(' ');
  }
}

class Marker extends Token {
  format(_formatter: Formatter): void {}

  // eslint-disable-next-line
  * text(formatter: Formatter): Iterable<string> {
    this.format(formatter);
  }
}

class BreakToken extends Marker {
  format(formatter: Formatter): void {
    formatter.requestNewline();
  }
}

class IndentToken extends Marker {
  format(formatter: Formatter): void {
    formatter.indent();
  }
}

class DedentToken extends Marker {
  format(formatter: Formatter): void {
    formatter.dedent();
  }
}

class SkipBreakToken extends Marker {
  format(formatter: Formatter): void {
    formatter.cancelNewline();
  }
}

export function indent(): Token {
  return new IndentToken();
}

export function dedent(): Token {
  return new DedentToken();
}

export function space(): Token {
  return new Space();
}

export function br(): Token {
  return new BreakToken();
}

export function nobr(): Token {
  return new SkipBreakToken();
}

export function text(text: string): Token {
  return new Content(text);
}
