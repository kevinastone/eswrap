/* @flow */
import type { Node, Switches } from './node';
import tokenize from './tokenize';

export type Cost = {
  overflows: number,
  lines: number,
};

function* lineCounts(iterable: Iterable<string>): Iterable<number> {
  let length = 0;
  for (let text of iterable) {
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

export function cost(node: Node, limit: number, switches: Switches): Cost {
  let overflows = 0;
  let lines = 0;

  for (const length of lineCounts(tokenize(node, switches))) {
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

export function compareCosts(a: Cost, b: Cost) {
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
