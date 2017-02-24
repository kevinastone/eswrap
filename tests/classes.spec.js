import 'mocha';
import 'chai';
import dedent from 'dedent-js';

import transform from './../index';

describe('Classes', () => {
  describe('Conformance', () => {
    describe('Declaration', () => {
      it(`should format a basic class`, () => {
        expect(transform(dedent`
          class Something {}
        `, 80)).toEqual(dedent`
          class Something {}
        `);
      });
      it(`should format a basic subclass`, () => {
        expect(transform(dedent`
          class Something extends Another {}
        `, 80)).toEqual(dedent`
          class Something extends Another {}
        `);
      });
      it(`should format a class expression`, () => {
        expect(transform(dedent`
          const Klass = class {};
        `, 80)).toEqual(dedent`
          const Klass = class {};
        `);
      });
      it(`should format a named class expression`, () => {
        expect(transform(dedent`
          const Klass = class Klass {};
        `, 80)).toEqual(dedent`
          const Klass = class Klass {};
        `);
      });
    });
    describe('Class Methods', () => {
      it(`should format a basic constructor`, () => {
        expect(transform(dedent`
          class Something {
            constructor() {}
          }
        `, 80)).toEqual(dedent`
          class Something {
            constructor() {}
          }
        `);
      });
      it(`should format a constructor with an argument list`, () => {
        expect(transform(dedent`
          class Something {
            constructor(something, another) {}
          }
        `, 80)).toEqual(dedent`
          class Something {
            constructor(something, another) {}
          }
        `);
      });
      it(`should format a constructor that uses the \`super\` keyword`, () => {
        expect(transform(dedent`
          class Something {
            constructor() {
              super();
            }
          }
        `, 80)).toEqual(dedent`
          class Something {
            constructor() {
              super();
            }
          }
        `);
      });
      it(`should format a basic method`, () => {
        expect(transform(dedent`
          class Something {
            method(something, another) {}
          }
        `, 80)).toEqual(dedent`
          class Something {
            method(something, another) {}
          }
        `);
      });
      it(`should format a Symbol-keyed generator method`, () => {
        expect(transform(dedent`
          class Something {
            * [Symbol.iterator](something, another) {}
          }
        `, 80)).toEqual(dedent`
          class Something {
            * [Symbol.iterator](something, another) {}
          }
        `);
      });
      it(`should format a property getter`, () => {
        expect(transform(dedent`
          class Something {
            get property() {}
          }
        `, 80)).toEqual(dedent`
          class Something {
            get property() {}
          }
        `);
      });
      it(`should format a property setter`, () => {
        expect(transform(dedent`
          class Something {
            set property(value) {}
          }
        `, 80)).toEqual(dedent`
          class Something {
            set property(value) {}
          }
        `);
      });
    });
    describe('Class Properties', () => {
      it(`should format a property declaration without a default value`, () => {
        expect(transform(dedent`
          class Something {
            color;
          }
        `, 80)).toEqual(dedent`
          class Something {
            color;
          }
        `);
      });
      it(`should format a property declaration that defines a default value`, () => {
        expect(transform(dedent`
          class Something {
            color = 'red';
          }
        `, 80)).toEqual(dedent`
          class Something {
            color = 'red';
          }
        `);
      });
    });
  });
});
