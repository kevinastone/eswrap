/* @flow */

import { Map as ImmMap, Set as ImmSet } from 'immutable';
import { product } from './iterables';
import type { GateID, Node, Switches, Variant } from './node';
import { Gate } from './gate';
import type { Cost } from './cost';
import { cost, compareCosts } from './cost';

const ROOT_GATE = 0;
const ROOT_VARIANT = 0;

type GateMap = ImmMap<GateID, ImmMap<Variant, ImmSet<GateID>>>;

function findGates(id: GateID, variant: Variant, map: GateMap, node: Node): GateMap {
  if (node instanceof Gate) {
    const gate: Gate = node;

    map = map.update(id, ImmMap(), map =>
      map.update(variant, ImmSet(), set => set.add(gate.id))
    );

    for (const variant of gate.enumerateVariants()) {
      // FlowIssue: Can't use the below because FlowJS hits a recursion limit
      // map = map.update(gate.id, ImmMap(), map =>
      //   map.set(variant, ImmSet())
      // );
      map = map.set(gate.id, (map.get(gate.id, ImmMap())).set(variant, ImmSet()));

      const switches = ImmMap([[gate.id, variant]]);
      for (const child of node.children(switches)) {
        map = findGates(gate.id, variant, map, child);
      }
    }
  } else {
    for (const child of node.children(ImmMap())) {
      map = findGates(id, variant, map, child);
    }
  }
  return map;
}

function* iterateGateVariants(id: GateID, map: GateMap): Iterable<Switches> {
  const variants = map.get(id);
  if (!variants) {
    return;
  }

  for (const [variant, children] of variants.entrySeq()) {
    const switches = ImmMap([[id, variant]]);
    if (children.size) {
      const iterables = Array.from(
        children.map(child => Array.from(iterateGateVariants(child, map)))
      );
      for (const toggles of product(...iterables)) {
        yield switches.merge(...toggles);
      }
    } else {
      yield switches;
    }
  }
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
