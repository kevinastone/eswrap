/* @flow */

import { List } from 'immutable';
import type { Node, Switches } from './node';
import { Indent } from './indent';

const INDENT_AMOUNT = 2;


export class Formatter {
  indentation: Indent;
  needsNewline: boolean;

  constructor() {
    this.indentation = new Indent(0);
    this.needsNewline = false;
  }

  indent(amount: number = INDENT_AMOUNT): void {
    this.indentation = new Indent(this.indentation.amount + amount, this.indentation);
  }

  dedent(): void {
    if (!this.indentation.parent) {
      throw Error('Tried to dedent the root indentation');
    }
    this.indentation = this.indentation.parent;
  }

  requestNewline(): void {
    this.needsNewline = true;
  }

  cancelNewline(): void {
    this.needsNewline = false;
  }

  * formating(): Iterable<string> {
    if (this.needsNewline) {
      this.needsNewline = false;
      yield '\n';
      yield ' '.repeat(this.indentation.amount);
    }
  }
}

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
