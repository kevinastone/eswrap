import 'mocha';
import 'chai';
import dedent from 'dedent-js';

import transform from './../index';

describe('Flow Types', () => {
  describe('Conformance', () => {
    describe('Import Types', () => {
      it(`should handle importing types`, () => {
        expect(transform(dedent`
          import type { MyType } from 'module';
        `, 80)).toEqual(dedent`
          import type { MyType } from 'module';
        `);
      });
    });
    describe('Function Types', () => {
      it(`should handle arguments types`, () => {
        expect(transform(dedent`
          function a(b: MyType) {}
        `, 80)).toEqual(dedent`
          function a(b: MyType) {}
        `);
      });
      it(`should handle return types`, () => {
        expect(transform(dedent`
          function a(b): MyType {}
        `, 80)).toEqual(dedent`
          function a(b): MyType {}
        `);
      });
    });
    describe('Declare Types', () => {
      it(`should handle number type aliases`, () => {
        expect(transform(dedent`
          type T = number;
        `, 80)).toEqual(dedent`
          type T = number;
        `);
      });
      it(`should handle void type aliases`, () => {
        expect(transform(dedent`
          type T = void;
        `, 80)).toEqual(dedent`
          type T = void;
        `);
      });
      it(`should handle generic type aliases`, () => {
        expect(transform(dedent`
          type T = Something;
        `, 80)).toEqual(dedent`
          type T = Something;
        `);
      });
      it(`should handle nullable type aliases`, () => {
        expect(transform(dedent`
          type T = ?Something;
        `, 80)).toEqual(dedent`
          type T = ?Something;
        `);
      });
      it(`should handle tuple type aliases`, () => {
        expect(transform(dedent`
          type T = [number, number];
        `, 80)).toEqual(dedent`
          type T = [number, number];
        `);
      });
      it(`should handle type aliases for functions`, () => {
        expect(transform(dedent`
          type Callback = (input: number) => boolean;
        `, 80)).toEqual(dedent`
          type Callback = (input: number) => boolean;
        `);
      });
      it(`should handle type aliases with generics`, () => {
        expect(transform(dedent`
          type T = Set<A, B>;
        `, 80)).toEqual(dedent`
          type T = Set<A, B>;
        `);
      });
      it(`should handle type aliases for functions with generics`, () => {
        expect(transform(dedent`
          type Callback<T> = (input: T) => boolean;
        `, 80)).toEqual(dedent`
          type Callback<T> = (input: T) => boolean;
        `);
      });
    });
    describe('Interfaces', () => {
      it(`should handle empty interfaces`, () => {
        expect(transform(dedent`
          interface Blah {}
        `, 20)).toEqual(dedent`
          interface Blah {}
        `);
      });
      xit(`should handle simple interfaces`, () => {
        expect(transform(dedent`
          interface Blah {
            method(): boolean;
          }
        `, 80)).toEqual(dedent`
          interface Blah {
            method(): boolean;
          }
        `);
      });
    });
  });
  it(`should should wrap function types at the assignment`, () => {
    expect(transform(dedent`
      type Callback = (input: number) => boolean;
    `, 20)).toEqual(dedent`
      type Callback =
        (input: number) =>
          boolean;
    `);
  });  
});
