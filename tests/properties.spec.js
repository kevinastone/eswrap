import 'mocha';
import 'chai';

import transform from './../index';

describe('Properties', () => {
  describe('Object Properties', () => {
    it(`shouldn't wrap object properties under length`, () => {
      expect(transform(`a.b = 20;`, 20)).toEqual(`a.b = 20;`);
    });
    it(`doesn't wrap object properties that exceed the length`, () => {
      expect(transform(`something.isReallyTooLong = 20;`, 20)).toEqual(`something.isReallyTooLong = 20;`);
    });
  });
});
