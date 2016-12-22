import 'mocha';
import 'chai';

import { Map as ImmMap, Set as ImmSet } from 'immutable';
import { iterateGateVariants } from './../lib/solve';

describe('Solve', () => {
  it(`should iterate variants`, () => {
    const gateMap = new ImmMap([
      [0, ImmMap([
        [0, ImmSet([1, 2])],
      ])],
      [1, ImmMap([
        [0, ImmSet([3, 4])],
        [1, ImmSet([5, 6])],
      ])],
      [2, ImmMap([
        [0, ImmSet([7, 8])],
      ])],
      [3, ImmMap([
        [0, ImmSet()],
        [1, ImmSet()],
      ])],
      [4, ImmMap([
        [0, ImmSet([9])],
      ])],
      [5, ImmMap([
        [0, ImmSet()],
        [1, ImmSet()],
      ])],
      [6, ImmMap([
        [0, ImmSet()],
      ])],
      [7, ImmMap([
        [0, ImmSet()],
      ])],
      [8, ImmMap([
        [0, ImmSet()],
      ])],
      [9, ImmMap([
        [0, ImmSet()],
      ])],
    ]);

    expect(Array.from(iterateGateVariants(0, gateMap)).map(toggle => toggle.toJS())).toEqual([
      { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 7: 0, 8: 0, 9: 0 },
      { 0: 0, 1: 0, 2: 0, 3: 1, 4: 0, 7: 0, 8: 0, 9: 0 },
      { 0: 0, 1: 1, 2: 0, 5: 0, 6: 0, 7: 0, 8: 0 },
      { 0: 0, 1: 1, 2: 0, 5: 1, 6: 0, 7: 0, 8: 0 },
    ]);
  });
});
