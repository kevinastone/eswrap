import 'mocha';
import 'chai';
import dedent from 'dedent-js';

import transform from './../index';

describe('Arrow Functions', () => {
  it(`shouldn't wrap lines under the length`, () => {
    expect(transform(`() => something`, 20)).toEqual(`() => something`);
  });
  it('should wrap block statements', () => {
    expect(transform(`() => { return something; }`, 30)).toEqual(dedent`
      () => {
        return something;
      }
    `);
  });
});
