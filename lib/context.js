/* @flow */
import { Stack } from 'immutable';
import { Indent } from './indent';
import type { Variant } from './node';
import type { Gate } from './gate';

const INDENT_AMOUNT = 2;

type GateVariant = [Gate, Variant];

export default class Context {
  indentation: Indent;
  gates: Stack<GateVariant>;

  constructor(
    indentation: Indent = new Indent(0),
    gates: Stack<GateVariant> = new Stack(),
  ) {
    this.indentation = indentation;
    this.gates = gates;
  }

  clone(): Context {
    return new Context(
      this.indentation,
      this.gates,
    );
  }

  update(properties: {[key: string]: any}): Context {
    const ctx = this.clone();
    return Object.assign(ctx, properties);
  }

  indent(amount: number = INDENT_AMOUNT): Context {
    return this.update({
      indentation: new Indent(this.indentation.amount + amount, this.indentation)
    });
  }

  dedent(): Context {
    if (!this.indentation.parent) {
      throw Error('Tried to dedent the root indentation');
    }
    return this.update({
      indentation: this.indentation.parent
    });
  }

  stack(gate: Gate, variant: Variant): Context {
    return this.update({
      gates: this.gates.push([gate, variant])
    });
  }
}
