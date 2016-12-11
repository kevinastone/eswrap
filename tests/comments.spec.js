import 'mocha';
import 'chai';
import dedent from 'dedent-js';

import transform from './../index';

describe('Comments', () => {
  describe('Block Comments', () => {
    it(`shouldn't wrap block comments`, () => {
      expect(transform(dedent`
        /* something
        else
        here */
        var a = 1;
      `, 20)).toEqual(dedent`
        /* something
        else
        here */
        var a = 1;
      `);
    });
  });
  describe('Line Comments', () => {
    it(`shouldn't wrap line comments`, () => {
      expect(transform(dedent`
        // something
        var a = 1;
      `, 20)).toEqual(dedent`
        // something
        var a = 1;
      `);
    });
  });
});
