import 'mocha';
import 'chai';
import dedent from 'dedent-js';

import transform from './../index';

describe('Objects', () => {
  describe('Conformance', () => {
    describe('Object Pattern', () => {
      it(`it should format shorthand object pattern`, () => {
        expect(transform(dedent`
          var { a, b } = { a: something, b: another };
        `, 80)).toEqual(dedent`
          var { a, b } = { a: something, b: another };
        `);
      });
      it(`it should format longhand object pattern`, () => {
        expect(transform(dedent`
          var { a: first, b: second } = { a: something, b: another };
        `, 80)).toEqual(dedent`
          var { a: first, b: second } = { a: something, b: another };
        `);
      });
    });
    xdescribe('Object Methods', () => {
      it(`it should format simple object method`, () => {
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
      it(`it should format simple object property getter`, () => {
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
      it(`it should format simple object property setter`, () => {
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
});
