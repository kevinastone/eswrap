import 'mocha';
import 'chai';
import dedent from 'dedent-js';

import transform from './../index';

describe('Properties', () => {
  describe('Object Properties', () => {
    it(`shouldn't wrap object properties under length`, () => {
      expect(transform(`a.b = 20;`, 20)).toEqual(`a.b = 20;`);
    });
    it(`should wrap object properties that exceed the length`, () => {
      expect(transform(dedent`
        something.isReallyTooLong = 20;
      `, 20)).toEqual(dedent`
        something
          .isReallyTooLong =
          20;
      `);
    });
  });
});
