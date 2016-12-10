import 'mocha';
import 'chai';
import dedent from 'dedent-js';

import transform from './../index';

describe('Arrays', () => {
  it(`shouldn't wrap lines under the length`, () => {
    expect(transform(`[1, 2, 3];`, 20)).toEqual(`[1, 2, 3];`);
  });
  it('should wrap arrays', () => {
    expect(transform(`[abcd, efgh, jklm];`, 7)).toEqual(dedent`
      [
        abcd,
        efgh,
        jklm,
      ];
    `);
  });
  it('should wrap arrays with trailing commas', () => {
    expect(transform(`[abcd, efgh, jklm, ];`, 7)).toEqual(dedent`
      [
        abcd,
        efgh,
        jklm,
      ];
    `);
  });
  it('should wrap nested arrays', () => {
    expect(transform(`[[abcd, efgh], jklm];`, 10)).toEqual(dedent`
      [
        [
          abcd,
          efgh,
        ],
        jklm,
      ];`);
  });
});
