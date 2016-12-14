import 'mocha';
import 'chai';
import dedent from 'dedent-js';

import transform from './../index';

describe('Statements', () => {
  describe('Conformance', () => {
    it(`should handle throw statements`, () => {
      expect(transform(dedent`
        throw error;
      `, 80)).toEqual(dedent`
        throw error;
      `);
    });
  });
  describe('If Statements', () => {
    it(`shouldn't wrap if statements if under length`, () => {
      expect(transform(`if (a == true) {}`, 20)).toEqual(dedent`
        if (a == true) {}
      `);
    });
    it(`should wrap if statements at the binary expressions`, () => {
      expect(transform(`if (something || another || more) {}`, 20)).toEqual(dedent`
        if (something ||
          another ||
          more) {}
      `);
    });
  });
  describe('While Statements', () => {
    it(`shouldn't wrap while statements while under length`, () => {
      expect(transform(`while (a == true) {}`, 20)).toEqual(dedent`
        while (a == true) {}
      `);
    });
    it(`should wrap while statements at the binary expressions`, () => {
      expect(transform(`while (something || another || more) {}`, 20)).toEqual(dedent`
        while (something ||
          another ||
          more) {}
      `);
    });
  });
  xdescribe('For of Statements', () => {
    it(`shouldn't wrap for-of statements if under length`, () => {
      expect(transform(`for (const a of []) {}`, 30)).toEqual(dedent`
        for (const a of []) {}
      `);
    });
    it(`should wrap if statements at the binary expressions`, () => {
      expect(transform(`for (const c of iter) {}`, 20)).toEqual(dedent`
        for (
          const c of iter
        ) {}
      `);
    });
  });
});
