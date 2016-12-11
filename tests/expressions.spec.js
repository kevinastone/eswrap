import 'mocha';
import 'chai';
import dedent from 'dedent-js';

import transform from './../index';

describe('Expressions', () => {
  describe('New Expression', () => {
    it(`shouldn't wrap lines under the length`, () => {
      expect(transform(`new Object();`, 20)).toEqual(`new Object();`);
    });
    it(`should wrap lines over the length`, () => {
      expect(transform(`new Object(first, second, third);`, 20)).toEqual(dedent`
        new Object(
          first,
          second,
          third,
        );`);
    });
  });
  xdescribe('Yield Expression', () => {
    it(`shouldn't wrap lines under the length`, () => {
      expect(transform(dedent`
        function* f() {
          yield value;
        }
      `, 20)).toEqual(dedent`
        function* f() {
          yield value;
        }
      `);
    });
  });
});
