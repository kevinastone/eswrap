import 'mocha';
import 'chai';
import dedent from 'dedent-js';

import transform from './../index';

describe('Arrow Functions', () => {
  describe('Conformance', () => {
    it(`it should format empty arguments`, () => {
      expect(transform(`() => something;`, 80)).toEqual(`() => something;`);
    });
    it(`it should format single arguments`, () => {
      expect(transform(`a => something;`, 80)).toEqual(`a => something;`);
    });
    it(`it should format multiple arguments`, () => {
      expect(transform(`(a, b) => something;`, 80)).toEqual(`(a, b) => something;`);
    });
  });
  it(`shouldn't wrap lines under the length`, () => {
    expect(transform(`() => something;`, 20)).toEqual(`() => something;`);
  });
  it('should wrap block statements', () => {
    expect(transform(`() => { return something; };`, 30)).toEqual(dedent`
      () => {
        return something;
      };
    `);
  });
});
