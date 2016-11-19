/* @flow */

/* eslint-disable no-param-reassign */
/* eslint-disable no-shadow */

import { List, Map, Set } from 'immutable';
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

// const ROOT_GATE = 0;
// const ROOT_VARIANT = 0;

// type GateMap = Map<GateID, Map<Variant, Set<GateID>>>;

// function findGates(id: GateID, variant: Variant, map: GateMap, node: Node): GateMap {
//   if (node instanceof Gate) {
//     const gate: Gate = node;

//     map = map.update(id, Map(), map =>
//       map.update(variant, Set(), set => set.add(gate.id))
//     );

//     for (const variant of node.enumerateVariants()) {
//       for (const child of node.children(variant)) {
//         map = findGates(gate.id, variant, map, child);
//       }
//     }
//   } else {
//     for (const child of node.children(variant)) {
//       map = findGates(id, variant, map, child);
//     }
//   }
//   return map;
// }

type SwitchOption = [GateID, Set<Variant>];

function findSwitchVariants(set: Set<SwitchOption>, node: Node): Set<SwitchOption> {
  if (node instanceof Gate) {
    const gate: Gate = node;

    const variants = Array.from(node.enumerateVariants());
    set = set.add([gate.id, Set(variants)]);
    for (const variant of variants) {
      for (const child of node.children(variant)) {
        set = findSwitchVariants(set, child);
      }
    }
  } else {
    for (const child of node.children(0)) {
      set = findSwitchVariants(set, child);
    }
  }
  return set;
}

function* iterateSwitchVariants(options: List<SwitchOption>): Iterable<Switches> {
  if (options.size <= 0) {
    yield Map();
    return;
  }

  const [gate, variants] = options.first();
  const remainder = options.shift();
  for (const variant of variants) {
    for (const map of iterateSwitchVariants(remainder)) {
      yield map.set(gate, variant);
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
  let switches = Map();
  let minCost = {
    overflows: Number.MAX_VALUE,
    lines: Number.MAX_VALUE,
  };

  for (const toggles of iterateSwitchVariants(
    List(
      findSwitchVariants(Set(), node)
    )
  )) {
    const newCost = cost(node, limit, toggles);
    if (compareCosts(newCost, minCost) < 0) {
      minCost = newCost;
      switches = toggles;
    }
  }
  return switches;
}
