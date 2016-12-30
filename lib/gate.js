/* @flow */

/* eslint-disable no-use-before-define */

import { List, Stack } from 'immutable';

import type { Node, NodeWriter, GateID, Switches, VariantID } from './node';
import { Token } from './token';
import { Chunk } from './chunk';

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
  variants: List<Variant>;
  anchored: ?boolean;

  constructor(id: ?GateID = undefined) {
    this.id = id || makeGateID();
    this.variants = List();
    this.anchored = null;
  }

  variant(ctx: Context, callback: VariantClosure): void {
    const variantID = this.variants.size;

    let anchor = variantID;

    for (const [parent, parentVariant] of ctx.gates.values()) {
      if (parent.anchored === true) {
        anchor = Math.min(parentVariant.id, anchor);
        break;
      } else if (parent.anchored === false) {
        anchor = variantID;
        break;
      }
    }

    if (variantID > anchor) {
      return;
    }

    const variant = new Variant(variantID);
    this.variants = this.variants.push(variant);
    callback(ctx.stack(this, variant), variant);
  }

  * enumerateVariants(): Iterable<VariantID> {
    for (let i = 0; i < this.variants.size; i += 1) {
      yield i;
    }
  }

  tokens(): List<Token> {
    return List();
  }

  children(switches: Switches): List<Node> {
    const variantID = switches.get(this.id);
    return this.variants.get(variantID, new Variant(variantID)).children(switches);
  }

  anchor(): void {
    this.anchored = true;
  }

  unanchor(): void {
    this.anchored = false;
  }
}

class Variant extends Chunk {
  id: VariantID;

  constructor(id: VariantID) {
    super();
    this.id = id;
  }
}

export class ChainedGate extends Gate {
  variant(ctx: Context, callback: VariantClosure): void {
    const variantID = this.variants.size;

    const top = ctx.gates.first();
    if (top) {
      const [parent, parentVariant] = top;
      if (parent instanceof ChainedGate) {
        if (parentVariant.id < variantID) {
          return;
        }
      }
    }
    super.variant(ctx, callback);
  }
}
