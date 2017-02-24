import 'mocha';
import 'chai';

import transform from './../index';

describe('Literals', () => {
  describe('Numbers', () => {
    it(`shouldn't wrap literals`, () => {
      expect(transform(`var a = 20;`, 20)).toEqual(`var a = 20;`);
    });
  });
  describe('Boolean values', () => {
    it(`shouldn't wrap literals`, () => {
      expect(transform(`var a = true;`, 20)).toEqual(`var a = true;`);
    });
  });
  describe('Strings', () => {
    it(`shouldn't wrap literals`, () => {
      expect(transform(`var a = 'hi';`, 20)).toEqual(`var a = 'hi';`);
    });
  });
  describe('RegExp literals', () => {
    it(`shouldn't wrap literals`, () => {
      expect(transform(`var a = /hi/;`, 20)).toEqual(`var a = /hi/;`);
    });
    it(`shouldn't wrap literals with flags`, () => {
      expect(transform(`var a = /hi/gi;`, 20)).toEqual(`var a = /hi/gi;`);
    });
  });
  describe('Template literals', () => {
    it(`shouldn't wrap literals`, () => {
      expect(transform('var a = `hi`;', 20)).toEqual('var a = `hi`;');
    });
    it(`shouldn't wrap literals with expressions`, () => {
      // eslint-disable-next-line
      expect(transform('var a = `hi ${ person}`;', 20)).toEqual('var a = `hi ${person}`;');
    });
    it(`shouldn't wrap literals with multiple expressions`, () => {
      // eslint-disable-next-line
      expect(transform('var a = `hi ${person}, good ${timeofday()}`;', 50)).toEqual('var a = `hi ${person}, good ${timeofday()}`;');
    });
  });
});
