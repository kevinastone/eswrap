/* @flow */

/* eslint-disable no-use-before-define */

import { List, Stack } from 'immutable';

import type { Node, NodeWriter, GateID, Switches, Variant } from './node';
import { Token } from './token';

let gateCounter: GateID = 0;

function makeGateID(): GateID {
  gateCounter += 1;
  return gateCounter;
}

type GateVariant = [Gate, Variant];
type VariantClosure = (ctx: Context, writer: NodeWriter) => void;

export class Context {
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

export class Gate {
  id: GateID;
  variants: List<List<Node>>;
  anchored: ?boolean;

  constructor(id: ?GateID = undefined) {
    this.id = id || makeGateID();
    this.variants = List();
    this.anchored = null;
  }

  variant(ctx: Context, callback: VariantClosure): void {
    const variant = this.variants.size;

    let anchor = variant;

    for (const [parent, parentVariant] of ctx.gates.values()) {
      if (parent.anchored === true) {
        anchor = Math.min(parentVariant, anchor);
        break;
      } else if (parent.anchored === false) {
        anchor = variant;
        break;
      }
    }

    if (variant > anchor) {
      return;
    }

    callback(ctx.stack(this, variant), new VariantView(this, variant));
  }

  * enumerateVariants(): Iterable<Variant> {
    for (let i = 0; i < this.variants.size; i += 1) {
      yield i;
    }
  }

  tokens(): List<Token> {
    return List();
  }

  children(switches: Switches): List<Node> {
    const variant = switches.get(this.id);
    return this.variants.get(variant, List());
  }

  anchor(): void {
    this.anchored = true;
  }

  unanchor(): void {
    this.anchored = false;
  }
}

class VariantView {
  gate: Gate;
  variant: Variant;

  constructor(gate: Gate, variant: Variant) {
    this.gate = gate;
    this.variant = variant;
    this.gate.variants = this.gate.variants.push(List());
  }

  append(node: Node): NodeWriter {
    this.gate.variants = this.gate.variants.update(this.variant, list => list.push(node));
    return this;
  }
}

export class ChainedGate extends Gate {
  variant(ctx: Context, callback: VariantClosure): void {
    const variant = this.variants.size;

    const top = ctx.gates.first();
    if (top) {
      const [parent, parentVariant] = top;
      if (parent instanceof ChainedGate) {
        if (parentVariant < variant) {
          return;
        }
      }
    }
    super.variant(ctx, callback);
  }
}
