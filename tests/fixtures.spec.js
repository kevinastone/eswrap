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
        const itHelper = 'skip' in expected.directive.attributes ? xit : it;
        itHelper('should match expected output', () => {
          expect(transform(input, length)).toEqual(expected.toString());
        });
      }
    });
  }
});
