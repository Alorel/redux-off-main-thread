import {expect} from 'chai';
import {compare} from 'fast-json-patch';
import {getChangedPaths} from './getChangedPaths';

describe('getChangedPaths', () => {
  it('Should return null on empty diff', () => {
    expect(getChangedPaths([])).to.eq(null);
  });

  it('Should return null if only top level paths changed (and nothing needs cloning)', () => {
    const diff = compare({foo: 1}, {foo: 0});
    expect(getChangedPaths(diff)).to.eq(null);
  });

  it('Should return sorted paths', () => {
    const srcObj = {
      a: {
        b: {
          c: [
            'a',
            'b',
            'c'
          ]
        },
        c: 5,
        d: {
          e: 2
        }
      },
      b: {
        a: [],
        foo: {
          bar: 1
        }
      },
      c: {
        foo: 10
      }
    };
    const outObj = {
      ...srcObj,
      a: {
        ...srcObj.a,
        b: {
          ...srcObj.b,
          a: 10,
          c: [
            'a',
            0
          ]
        },
        c: 1
      },
      b: {
        ...srcObj.b,
        foo: {
          ...srcObj.b.foo,
          qux: 0
        }
      }
    };

    const diff = compare(srcObj, outObj);
    const paths = getChangedPaths(diff);
    expect(paths).to.deep.eq([
      ['a'],
      ['b'],
      ['a', 'b'],
      ['b', 'foo'],
      ['a', 'b', 'c']
    ]);
  });
});
