import 'mocha';
import 'chai';
import dedent from 'dedent-js';

import transform from './../index';

describe('Function Declarations', () => {
  it(`shouldn't wrap lines under the length`, () => {
    expect(transform(`function f() {}`, 20)).toEqual(`function f() {}`);
  });
  it('should wrap function parameters', () => {
    expect(transform(`function f(something, another, more) {}`, 20)).toEqual(dedent`
      function f(
        something,
        another,
        more,
      ) {}
    `);
  });
  describe('Generator Functions', () => {
    it(`shouldn't wrap lines under the length`, () => {
      expect(transform(`function* f() {}`, 20)).toEqual(`function* f() {}`);
    });
  });
  it('should wrap function parameters', () => {
    expect(transform(`function* f(something, another, more) {}`, 20)).toEqual(dedent`
      function* f(
        something,
        another,
        more,
      ) {}
    `);
  });
});
