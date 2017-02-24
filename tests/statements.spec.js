import 'mocha';
import 'chai';
import dedent from 'dedent-js';

import transform from './../index';

describe('Statements', () => {
  describe('Conformance', () => {
    it(`should handle \`throw\``, () => {
      expect(transform(dedent`
        throw error;
      `, 80)).toEqual(dedent`
        throw error;
      `);
    });
    it(`should handle \`break\``, () => {
      expect(transform(dedent`
        while (true) {
          break;
        }
      `, 80)).toEqual(dedent`
        while (true) {
          break;
        }
      `);
    });
    it(`should handle \`try/catch\``, () => {
      expect(transform(dedent`
        try {}
        catch (ex) {}
      `, 80)).toEqual(dedent`
        try {}
        catch (ex) {}
      `);
    });
    it(`should handle \`try/finally\``, () => {
      expect(transform(dedent`
        try {}
        finally {}
      `, 80)).toEqual(dedent`
        try {}
        finally {}
      `);
    });
  });
  describe('If Statements', () => {
    it(`shouldn't wrap \`if\` when under length`, () => {
      expect(transform(`if (a == true) {}`, 20)).toEqual(dedent`
        if (a == true) {}
      `);
    });
    it(`shouldn't wrap \`if/else\` when under length`, () => {
      expect(transform(dedent`
        if (a == true) {
          true;
        } else {
          false;
        }
      `, 30)).toEqual(dedent`
        if (a == true) {
          true;
        } else {
          false;
        }
      `);
    });
    it(`shouldn't wrap \`if/elseif\` when under length`, () => {
      expect(transform(dedent`
        if (a == true) {
          true;
        } else if (a == false) {
          false;
        } else {}
      `, 30)).toEqual(dedent`
        if (a == true) {
          true;
        } else if (a == false) {
          false;
        } else {}
      `);
    });
    it(`should wrap \`if\` at binary expressions`, () => {
      expect(transform(`if (something || another || more) {}`, 20)).toEqual(dedent`
        if (
          something ||
            another ||
            more
        ) {}
      `);
    });
  });
  describe('While Statements', () => {
    it(`shouldn't wrap \`while\` if under length`, () => {
      expect(transform(`while (a == true) {}`, 20)).toEqual(dedent`
        while (a == true) {}
      `);
    });
    it(`should wrap \`while\` at binary expressions`, () => {
      expect(transform(`while (something || another || more) {}`, 20)).toEqual(dedent`
        while (
          something ||
            another ||
            more
        ) {}
      `);
    });
  });
  describe('For-of Statements', () => {
    it(`shouldn't wrap \`for-of\` if under length`, () => {
      expect(transform(`for (const a of []) {}`, 30)).toEqual(dedent`
        for (const a of []) {}
      `);
    });
    it(`should wrap \`for-of\` at binary expressions`, () => {
      expect(transform(`for (const c of iter) {}`, 20)).toEqual(dedent`
        for (
          const c of iter
        ) {}
      `);
    });
  });
  describe('For Statements', () => {
    it(`shouldn't wrap \`for\` if under length`, () => {
      expect(transform(dedent`
        for (let i = 0; i < 10; i++) {}
      `, 40)).toEqual(dedent`
        for (let i = 0; i < 10; i++) {}
      `);
    });
    it(`shouldn't wrap empty \`for\` loops if under length`, () => {
      expect(transform(dedent`
        for (;;) {}
      `, 40)).toEqual(dedent`
        for (;;) {}
      `);
    });
  });
});
