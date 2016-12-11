/* @flow */

/* eslint-disable no-use-before-define */

import { List } from 'immutable';

import type { Node, NodeWriter, GateID, Switches, Variant } from './node';
import type Context from './context';
import { Token } from './token';

let gateCounter: GateID = 0;

function makeGateID(): GateID {
  gateCounter += 1;
  return gateCounter;
}

type VariantClosure = (ctx: Context, writer: NodeWriter) => void;

export class Gate {
  id: GateID;
  variants: List<List<Node>>;

  constructor(id: ?GateID = undefined) {
    this.id = id || makeGateID();
    this.variants = List();
  }

  variant(ctx: Context, callback: VariantClosure): void {
    const variant = this.variants.size;
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

export class LinkedGate extends Gate {
  variant(ctx: Context, callback: VariantClosure): void {
    const variant = this.variants.size;

    for (const [parent, parentVariant] of ctx.gates.values()) {
      if (parent instanceof LinkedGate) {
        if (parentVariant < variant) {
          return;
        }
      }
    }
    super.variant(ctx, callback);
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
