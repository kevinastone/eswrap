/* @flow */
import { Stack } from 'immutable';
import type { Variant } from './node';
import type { Gate } from './gate';

type GateVariant = [Gate, Variant];

export default class Context {
  gates: Stack<GateVariant>;

  constructor(
    gates: Stack<GateVariant> = new Stack(),
  ) {
    this.gates = gates;
  }

  clone(): Context {
    return new Context(
      this.gates,
    );
  }

  update(properties: {[key: string]: any}): Context {
    const ctx = this.clone();
    return Object.assign(ctx, properties);
  }

  stack(gate: Gate, variant: Variant): Context {
    return this.update({
      gates: this.gates.push([gate, variant])
    });
  }
}
