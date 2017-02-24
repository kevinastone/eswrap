import 'mocha';
import 'chai';
import dedent from 'dedent-js';

import transform from './../index';

describe('Objects', () => {
  describe('Conformance', () => {
    describe('Destructured Assignment', () => {
      it(`should format shorthand destructuring`, () => {
        expect(transform(dedent`
          var { a, b } = { a: something, b: another };
        `, 80)).toEqual(dedent`
          var { a, b } = { a: something, b: another };
        `);
      });
      it(`should format longhand destructuring`, () => {
        expect(transform(dedent`
          var { a: first, b: second } = { a: something, b: another };
        `, 80)).toEqual(dedent`
          var { a: first, b: second } = { a: something, b: another };
        `);
      });
    });
    xdescribe('Object Methods', () => {
      it(`should format simple methods`, () => {
        expect(transform(dedent`
          var myObj = {
            method(something, another) {}
          }
        `, 80)).toEqual(dedent`
          var myObj = {
            method(something, another) {}
          }
        `);
      });
      it(`should format property getters`, () => {
        expect(transform(dedent`
          var myObj = {
            get property() {}
          }
        `, 80)).toEqual(dedent`
          var myObj = {
            get property() {}
          }
        `);
      });
      it(`should format property setters`, () => {
        expect(transform(dedent`
          var myObj = {
            set property(value) {}
          }
        `, 80)).toEqual(dedent`
          var myObj = {
            set property(value) {}
          }
        `);
      });
    });
  });
  describe('Object Assignment', () => {
    it(`shouldn't wrap object properties under length`, () => {
      expect(transform(dedent`
        var myObj = { some: value };
      `, 30)).toEqual(dedent`
        var myObj = { some: value };
      `);
    });
    it(`should wrap object properties with each property`, () => {
      expect(transform(dedent`
        var myObj = { some: value };
      `, 20)).toEqual(dedent`
        var myObj = {
          some: value,
        };
      `);
    });
  });
  describe('Object Arguments', () => {
    it(`shouldn't wrap object arguments under length`, () => {
      expect(transform(dedent`
        func({ a: 1 });
      `, 30)).toEqual(dedent`
        func({ a: 1 });
      `);
    });
    it(`should wrap object arguments over length`, () => {
      expect(transform(dedent`
        func({ something: value });
      `, 20)).toEqual(dedent`
        func({
          something: value,
        });
      `);
    });
  });
});
