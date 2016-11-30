import 'mocha';
import 'chai';
import dedent from 'dedent-js';

import transform from './../index';

describe('Import Declarations', () => {
  it(`shouldn't wrap lines under the length`, () => {
    expect(transform(`import a from 'b';`, 20)).toEqual(`import a from 'b';\n`);
  });
  it(`should wrap long imports with destructuring`, () => {
    expect(transform(`import { reallyLongName, anotherLongName } from 'package';`, 20)).toEqual(dedent`
      import {
        reallyLongName,
        anotherLongName,
      } from 'package';\n
    `);
  });
});

describe('Export Declarations', () => {
  it(`shouldn't wrap lines under the length`, () => {
    expect(transform(`export default function() {};`, 30)).toEqual(`export default function() {};\n`);
  });
});
