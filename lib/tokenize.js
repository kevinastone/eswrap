/* @flow */

import type { Node, Switches } from './node';

import { Indent } from './indent';

const INDENT_AMOUNT = 2;

export class Context {
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

  newline(): void {
    this.needsNewline = true;
  }

  * yield(text: string): Iterable<string> {
    if (this.needsNewline) {
      this.needsNewline = false;
      yield '\n';
      yield ' '.repeat(this.indentation.amount);
    }
    yield text;
  }
}

function* walk(node: Node, switches: Switches): Iterable<Token> {
  for (const token of node.tokens(switches)) {
    yield token;
  }
  for (const child of node.children(switches)) {
    yield* walk(child, switches);
  }
}

function* tokenize(ctx: Context, node: Node, switches: Switches): Iterable<string> {
  for (const token of walk(node, switches)) {
    yield* token.text(ctx);
  }
}

export default function* (node: Node, switches: Switches): Iterable<string> {
  const ctx = new Context();
  yield* tokenize(ctx, node, switches);
}
