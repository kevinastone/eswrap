import 'mocha';
import 'chai';
import dedent from 'dedent-js';

import transform from './../index';

describe('Expressions', () => {
  describe('Conformance', () => {
    describe('Patterns', () => {
      it(`should handle array patterns`, () => {
        expect(transform(dedent`
          var [a, b] = input;
        `, 80)).toEqual(dedent`
          var [a, b] = input;
        `);
      });
    });
    describe('Unary Operators', () => {
      it(`should handle delete unary expressions`, () => {
        expect(transform(dedent`
          delete a.b;
        `, 80)).toEqual(dedent`
          delete a.b;
        `);
      });
      it(`should handle typeof unary expressions`, () => {
        expect(transform(dedent`
          typeof a.b;
        `, 80)).toEqual(dedent`
          typeof a.b;
        `);
      });
      it(`should handle void unary expressions`, () => {
        expect(transform(dedent`
          void a.b;
        `, 80)).toEqual(dedent`
          void a.b;
        `);
      });
      it(`should handle prefix unary expressions`, () => {
        expect(transform(dedent`
          var a = !true;
        `, 80)).toEqual(dedent`
          var a = !true;
        `);
      });
      it(`should handle prefix negation expressions`, () => {
        expect(transform(dedent`
          var a = -x;
        `, 80)).toEqual(dedent`
          var a = -x;
        `);
      });
      it(`should handle prefis update expressions`, () => {
        expect(transform(dedent`
          var a = ++count;
        `, 80)).toEqual(dedent`
          var a = ++count;
        `);
      });
      it(`should handle suffix update expressions`, () => {
        expect(transform(dedent`
          var a = count++;
        `, 80)).toEqual(dedent`
          var a = count++;
        `);
      });
    });
  });
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
  describe('Yield Expression', () => {
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
  describe('Member Expression', () => {
    it(`shouldn't wrap lines under the length`, () => {
      expect(transform(dedent`
        a.b.c();
      `, 20)).toEqual(dedent`
        a.b.c();
      `);
    });
    it.only(`should wrap lines over the length at the dot operator`, () => {
      expect(transform(dedent`
        another.value.method();
      `, 20)).toEqual(dedent`
        another.value
          .method();
      `);
    });
  });
  describe('Patterns', () => {
    it(`should handle not split array patterns under length`, () => {
      expect(transform(dedent`
        var [a, b] = input;
      `, 20)).toEqual(dedent`
        var [a, b] = input;
      `);
    });
    it(`should handle split array patterns at the arguments length`, () => {
      expect(transform(dedent`
        var [something, another] = input;
      `, 20)).toEqual(dedent`
        var [
          something,
          another,
        ] = input;
      `);
    });
  });
});
