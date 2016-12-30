/* @flow */

import { Map as ImmMap, Set as ImmSet } from 'immutable';
import { product } from './iterables';
import type { GateID, Node, Switches, VariantID } from './node';
import { Gate } from './gate';
import type { Cost } from './cost';
import { cost, compareCosts } from './cost';

const ROOT_GATE = 0;
const ROOT_VARIANT = 0;

export type GateMap = ImmMap<GateID, ImmMap<VariantID, ImmSet<GateID>>>;

function findGates(id: GateID, variantID: VariantID, map: GateMap, node: Node): GateMap {
  if (node instanceof Gate) {
    const gate: Gate = node;

    map = map.update(id, ImmMap(), map =>
      map.update(variantID, ImmSet(), set => set.add(gate.id))
    );

    for (const variantID of gate.enumerateVariants()) {
      // FlowIssue: Can't use the below because FlowJS hits a recursion limit
      // map = map.update(gate.id, ImmMap(), map =>
      //   map.set(variant, ImmSet())
      // );
      map = map.set(gate.id, (map.get(gate.id, ImmMap())).set(variantID, ImmSet()));

      const switches = ImmMap([[gate.id, variantID]]);
      for (const child of node.children(switches)) {
        map = findGates(gate.id, variantID, map, child);
      }
    }
  } else {
    for (const child of node.children(ImmMap())) {
      map = findGates(id, variantID, map, child);
    }
  }
  return map;
}

class GateVariantIterator {
  id: GateID;
  map: GateMap;

  constructor(id: GateID, map: GateMap) {
    this.id = id;
    this.map = map;
  }

  // $FlowIssue
  * [Symbol.iterator](): Iterable<Switches> {
    const variants = this.map.get(this.id);
    if (!variants) {
      return;
    }

    for (const [variant, children] of variants.entrySeq()) {
      const switches = ImmMap.of(this.id, variant);
      if (children.size) {
        const iterables = Array.from(
          children.map(child => new GateVariantIterator(child, this.map))
        );
        for (const toggles of product(...iterables)) {
          yield switches.merge(...toggles);
        }
      } else {
        yield switches;
      }
    }
  }
}

export function* iterateGateVariants(id: GateID, map: GateMap): Iterable<Switches> {
  // $FlowIssue
  yield* new GateVariantIterator(id, map);
}

const COST_THRESHOLD: Cost = {
  overflows: 0,
  lines: Number.MAX_VALUE
};

export default function(node: Node, limit: number): Switches {
  let switches = ImmMap();
  let minCost: Cost = {
    overflows: Number.MAX_VALUE,
    lines: Number.MAX_VALUE,
  };

  const gateMap = findGates(ROOT_GATE, ROOT_VARIANT, ImmMap(), node);
  for (const toggles of iterateGateVariants(ROOT_GATE, gateMap)) {
    const newCost = cost(node, limit, toggles);
    if (compareCosts(newCost, minCost) < 0) {
      minCost = newCost;
      switches = toggles;
    }

    if (compareCosts(minCost, COST_THRESHOLD) < 0) {
      break;
    }
  }
  return switches;
}
