import 'mocha';
import 'chai';

import transform from './../index';

describe('Literals', () => {
  describe('NumericLiterals', () => {
    it(`shouldn't wrap literals`, () => {
      expect(transform(`var a = 20;`, 20)).toEqual(`var a = 20;`);
    });
  });
  describe('BooleanLiterals', () => {
    it(`shouldn't wrap literals`, () => {
      expect(transform(`var a = true;`, 20)).toEqual(`var a = true;`);
    });
  });
  describe('StringLiterals', () => {
    it(`shouldn't wrap literals`, () => {
      expect(transform(`var a = 'hi';`, 20)).toEqual(`var a = 'hi';`);
    });
  });
  describe('TemplateLiterals', () => {
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
