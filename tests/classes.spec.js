import 'mocha';
import 'chai';
import dedent from 'dedent-js';

import transform from './../index';

describe('Classes', () => {
  describe('Conformance', () => {
    describe('Declaration', () => {
      it(`it should format simple class declarations`, () => {
        expect(transform(dedent`
          class Something {}
        `, 80)).toEqual(dedent`
          class Something {}
        `);
      });
      it(`it should format simple class declaration with super-classes`, () => {
        expect(transform(dedent`
          class Something extends Another {}
        `, 80)).toEqual(dedent`
          class Something extends Another {}
        `);
      });
      it(`it should format simple class expressions`, () => {
        expect(transform(dedent`
          const Klass = class {};
        `, 80)).toEqual(dedent`
          const Klass = class {};
        `);
      });
      it(`it should format named class expressions`, () => {
        expect(transform(dedent`
          const Klass = class Klass {};
        `, 80)).toEqual(dedent`
          const Klass = class Klass {};
        `);
      });
    });
    describe('Class Methods', () => {
      it(`it should format simple class constructor`, () => {
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
      it(`it should format class constructor with arguments`, () => {
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
      it(`it should format class constructor with super`, () => {
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
      it(`it should format simple class method`, () => {
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
      it(`it should format simple class property getter`, () => {
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
      it(`it should format simple class property setter`, () => {
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
      it(`it should format simple properties without values`, () => {
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
      it(`it should format simple properties with values`, () => {
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
