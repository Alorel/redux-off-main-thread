import {expect} from 'chai';
import {clonePath} from './clonePath';

describe('clonePath', () => {

  describe('Type clones', () => {
    const specs: Array<[string, () => any]> = [
      ['Object', () => ({qux: 1})],
      ['Array', () => ['qux']]
    ];

    for (const [type, getValue] of specs) {
      describe(`${type} type clone`, () => {
        let origObj: any;
        let newObj: any;

        before(() => {
          origObj = {
            bar: {},
            foo: getValue()
          };
          newObj = clonePath({...origObj}, ['foo']);
        });

        it('bar path should stay the same', () => {
          expect(newObj.bar).to.eq(origObj.bar);
        });

        it('Foo path should have changed', () => {
          expect(newObj.foo).to.not.eq(origObj.foo);
        });

        it('Foo path should remain deeply equal', () => {
          expect(newObj.foo).to.deep.eq(origObj.foo);
        });
      });
    }
  });
});
