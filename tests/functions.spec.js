import 'mocha';
import 'chai';
import dedent from 'dedent-js';

import transform from './../index';

describe('Functions', () => {
  describe('Conformance', () => {
    describe('Declarations', () => {
      it(`should handle default arguments`, () => {
        expect(transform(dedent`
          function f(a = 1, b = 2) {}
        `, 80)).toEqual(dedent`
          function f(a = 1, b = 2) {}
        `);
      });
      it(`should handle rest arguments`, () => {
        expect(transform(dedent`
          function f(...a) {}
        `, 80)).toEqual(dedent`
          function f(...a) {}
        `);
      });
      it(`should handle spread arguments`, () => {
        expect(transform(dedent`
          f(...a);
        `, 80)).toEqual(dedent`
          f(...a);
        `);
      });
    });
    describe('Expressions', () => {
      it(`should handle expressions`, () => {
        expect(transform(dedent`
          func(function(a, b) {});
        `, 80)).toEqual(dedent`
          func(function(a, b) {});
        `);
      });
      it(`should handle expressions with other parameters`, () => {
        expect(transform(dedent`
          func(function(a, b) {}, another);
        `, 80)).toEqual(dedent`
          func(function(a, b) {}, another);
        `);
      });
      it(`should handle expressions with bodies`, () => {
        expect(transform(dedent`
          func(function(a, b) {
            return false;
          });
        `, 80)).toEqual(dedent`
          func(function(a, b) {
            return false;
          });
        `);
      });
    });
  });
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
