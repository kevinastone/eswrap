import 'mocha';
import 'chai';
import dedent from 'dedent-js';

import transform from './../index';

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
    expect(transform(`let firstParameterAA = 1, secondParameter = 2;`, 24)).toEqual(dedent`
      let
        firstParameterAA = 1,
          secondParameter = 2;
    `);
  });
});
