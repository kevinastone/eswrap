/* @flow */

import { Map as ImmMap, Set as ImmSet } from 'immutable';
import { product } from './iterables';
import type { GateID, Node, Switches, Variant } from './node';
import { Gate } from './gate';
import tokenize from './tokenize';

type Cost = {
  overflows: number,
  lines: number,
};

function* lineCounts(node: Node, switches: Switches): Iterable<number> {
  let length = 0;
  for (let text of tokenize(node, switches)) {
    // eslint-disable-next-line
    while (true) {

      const vals = text.split('\n', 2);
      length += vals[0].length;

      if (vals.length < 2) {
        break;
      }

      // We must have a line-break here
      yield length;
      length = 0;
      text = vals[1];
    }
  }

  if (length > 0) {
    yield length;
  }
}

function cost(node: Node, limit: number, switches: Switches): Cost {
  let overflows = 0;
  let lines = 0;

  for (const length of lineCounts(node, switches)) {
    lines += 1;
    if (length > limit) {
      overflows += 1;
    }
  }

  return {
    overflows,
    lines,
  };
}

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
      const iterables = children.map(child => iterateGateVariants(child, map));  // $FlowFixMe
      for (const toggles of product(...iterables)) {
        yield switches.merge(...toggles);
      }
    } else {
      yield switches;
    }
  }
}

function compareCosts(a: Cost, b: Cost) {
  if (a.overflows < b.overflows) {
    return -1;
  } else if (a.overflows > b.overflows) {
    return 1;
  }

  if (a.lines < b.lines) {
    return -1;
  } else if (a.lines > b.lines) {
    return 1;
  }
  return 0;
}

export default function(node: Node, limit: number): Switches {
  let switches = ImmMap();
  let minCost = {
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
  }
  return switches;
}
