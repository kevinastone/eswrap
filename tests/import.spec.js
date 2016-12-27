import 'mocha';
import 'chai';
import dedent from 'dedent-js';

import transform from './../index';

describe('Import Declarations', () => {
  describe('Import Specifiers', () => {
    it(`shouldn't wrap lines under the length`, () => {
      expect(transform(`import { a } from 'b';`, 30)).toEqual(`import { a } from 'b';`);
    });
    it(`shouldn't wrap lines under the length`, () => {
      expect(transform(`import { a as b } from 'b';`, 30)).toEqual(`import { a as b } from 'b';`);
    });
    it(`should wrap long imports with destructuring`, () => {
      expect(transform(`import { reallyLongName, anotherLongName } from 'package';`, 20)).toEqual(dedent`
        import {
          reallyLongName,
          anotherLongName,
        } from 'package';
      `);
    });
  });
  describe('Default Specifiers', () => {
    it(`shouldn't wrap default lines under the length`, () => {
      expect(transform(`import a from 'b';`, 20)).toEqual(`import a from 'b';`);
    });
    it(`shouldn't wrap lines with import names`, () => {
      expect(transform(`import 'b';`, 20)).toEqual(`import 'b';`);
    });
  });
  describe('Import Namespaces', () => {
    it(`shouldn't wrap lines with import aliases`, () => {
      expect(transform(`import * as a from 'b';`, 30)).toEqual(`import * as a from 'b';`);
    });
  });
  it(`shouldn't wrap lines with compound imports`, () => {
    expect(transform(`import a, { b as c } from 'b';`, 30)).toEqual(`import a, { b as c } from 'b';`);
  });
});

describe('Export Declarations', () => {
  describe('Export Functions', () => {
    it(`shouldn't wrap default lines under the length`, () => {
      expect(transform(`export default function() {}`, 30)).toEqual(`export default function() {}`);
    });
    it(`shouldn't wrap lines under the length`, () => {
      expect(transform(`export function blah() {}`, 30)).toEqual(`export function blah() {}`);
    });
  });
  describe('Export Identifiers', () => {
    it(`shouldn't wrap default lines under the length`, () => {
      expect(transform(`export default something;`, 30)).toEqual(`export default something;`);
    });
  });
});
