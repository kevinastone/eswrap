/* @flow */

const INDENT_AMOUNT = 2;

class Indent {
  amount: number;
  parent: ?Indent;

  constructor(amount: number, parent: ?Indent = null) {
    this.amount = amount;
    this.parent = parent;
  }
}

export default class Formatter {
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
