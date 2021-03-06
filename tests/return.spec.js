import 'mocha';
import 'chai';
import dedent from 'dedent-js';

import transform from './../index';

describe('Return Statements', () => {
  describe('Conformance', () => {
    it(`should handle empty returns`, () => {
      expect(transform(dedent`
        () => {
          return;
        };
      `, 80)).toEqual(dedent`
        () => {
          return;
        };
      `);
    });
  });
  it(`shouldn't wrap lines under the length`, () => {
    expect(transform(`() => { return func(1, 2, 3); };`, 40)).toEqual(dedent`
      () => {
        return func(1, 2, 3);
      };
    `);
  });
  it('should wrap function calls', () => {
    expect(transform(`() => { return func(firstParameter, secondParameter, thirdParameter); };`, 30)).toEqual(dedent`
      () => {
        return func(
          firstParameter,
          secondParameter,
          thirdParameter,
        );
      };
    `);
  });
});
