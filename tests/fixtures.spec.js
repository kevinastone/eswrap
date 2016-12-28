import 'mocha';
import 'chai';

import transform from './../index';
import { getFixtures, parseFixture } from './fixtures';

describe('Fixtures', () => {
  for (const filename of getFixtures()) {
    const fixture = parseFixture(filename);
    const describeHelper = 'skip' in fixture.input.directive.attributes ? xdescribe : describe;
    describeHelper(`Fixture ${filename}`, () => {
      const input = fixture.input.toString();
      for (const expected of fixture.expected) {
        const length = parseInt(expected.directive.attributes.length || "80", 10);
        let itHelper = 'skip' in expected.directive.attributes ? xit : it;
        itHelper = 'only' in expected.directive.attributes ? itHelper.only : itHelper;
        itHelper('should match expected output', () => {
          expect(transform(input, length).trim()).toEqual(expected.toString().trim());
        });
      }
    });
  }
});
