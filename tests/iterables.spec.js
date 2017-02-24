import 'mocha';
import 'chai';

import { product } from './../lib/iterables';

describe('product', () => {
  it(`iterates empty inputs`, () => {
    expect(Array.from(product())).toEqual([]);
  });
  it(`iterates single values`, () => {
    expect(Array.from(product([1, 2, 3]))).toEqual([[1], [2], [3]]);
  });
  it(`iterates multiple values`, () => {
    expect(Array.from(product([1, 2], ['A', 'B']))).toEqual([[1, 'A'], [1, 'B'], [2, 'A'], [2, 'B']]);
  });
});
