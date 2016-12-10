import 'mocha';
import 'chai';
import dedent from 'dedent-js';

import transform from './../index';

describe('Function Parameters', () => {
  it(`shouldn't wrap lines under the length`, () => {
    expect(transform(`func(1, 2, 3);`, 20)).toEqual(`func(1, 2, 3);`);
  });
  it('should wrap function calls', () => {
    expect(transform(`reallyLongName(firstParameter, secondParameter, thirdParameter)`, 20)).toEqual(dedent`
      reallyLongName(
        firstParameter,
        secondParameter,
        thirdParameter,
      );
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
