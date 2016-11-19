/* eslint-disable quotes */
/* eslint-disable no-trailing-spaces */

import 'mocha';
import 'chai';
import dedent from 'dedent-js';

import transform from './../index';

describe('ESWrap', () => {
  describe('Variable Declarations', () => {
    it(`shouldn't wrap lines under the length`, () => {
      expect(transform(`let a = 1, b = 2;`, 20)).toEqual(`let a = 1, b = 2;`);
    });
    it('should wrap variable declarations', () => {
      expect(transform(`let firstParameter = 1, secondParameter = 2;`, 25)).toEqual(dedent`
        let firstParameter = 1,
          secondParameter = 2;
      `);
    });
    it('should wrap variable declarations after kind', () => {
      expect(transform(`let firstParameter = 1, secondParameter = 2;`, 22)).toEqual(dedent`
        let
          firstParameter = 1,
          secondParameter = 2;
      `);
    });
  });
  describe('Function Parameters', () => {
    it(`shouldn't wrap lines under the length`, () => {
      expect(transform(`func(1, 2, 3)`, 20)).toEqual(`func(1, 2, 3)`);
    });
    it('should wrap function calls', () => {
      expect(transform(`reallyLongName(firstParameter, secondParameter, thirdParameter)`, 20)).toEqual(dedent`
        reallyLongName(
          firstParameter,
          secondParameter,
          thirdParameter,
        )
      `);
    });
    it('should wrap function calls with assignments', () => {
      expect(transform(`const output = reallyLongName(firstParameter, secondParameter, thirdParameter);`, 30)).toEqual(dedent`
        const output = reallyLongName(
          firstParameter,
          secondParameter,
          thirdParameter,
        );
      `);
    });
  });
  describe('Arrays', () => {
    it(`shouldn't wrap lines under the length`, () => {
      expect(transform(`[1, 2, 3]`, 20)).toEqual(`[1, 2, 3]`);
    });
    it('should wrap arrays', () => {
      expect(transform(`[abcd, efgh, jklm]`, 7)).toEqual(dedent`
        [
          abcd,
          efgh,
          jklm,
        ]
      `);
    });
    it('should wrap arrays with trailing commas', () => {
      expect(transform(`[abcd, efgh, jklm, ]`, 7)).toEqual(dedent`
        [
          abcd,
          efgh,
          jklm,
        ]
      `);
    });
    it('should wrap nested arrays', () => {
      expect(transform(`[[abcd, efgh], jklm]`, 10)).toEqual(dedent`
        [
          [
            abcd,
            efgh,
          ],
          jklm,
        ]`);
    });
  });
});
