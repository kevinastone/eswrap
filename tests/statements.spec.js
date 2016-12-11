import 'mocha';
import 'chai';
import dedent from 'dedent-js';

import transform from './../index';

describe('Statements', () => {
  describe('If Statements', () => {
    it(`shouldn't wrap if statements if under lenth`, () => {
      expect(transform(`if (a == true) {}`, 20)).toEqual(dedent`
        if (a == true) {}
      `);
    });
    it(`should wrap if statements at the binary expressions`, () => {
      expect(transform(`
        if (something || another || more) {}`, 20)).toEqual(dedent`
        if (
          something ||
            another ||
            more
        ) {}
      `);
    });
  });
});
