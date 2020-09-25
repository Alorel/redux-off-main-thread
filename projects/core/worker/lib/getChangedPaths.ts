import {Obj} from '@alorel/commons-obj';
import {Operation} from 'fast-json-patch';

const SEPARATOR = /\//g;

function getChangedPathsReducer(acc: Obj<string[]>, op: Operation): Obj<string[]> {
  let pathSplit = op.path.split(SEPARATOR).slice(1, -1);
  switch (pathSplit.length) {
    case 0:
      break;
    case 1:
      acc[pathSplit[0]] = pathSplit;
      break;
    default:
      do {
        acc[pathSplit.join('/')] = pathSplit;
        pathSplit = pathSplit.slice(0, pathSplit.length - 1);
      } while (pathSplit.length);
  }
  if (pathSplit.length) {
    acc[pathSplit.join('/')] = pathSplit;
  }

  return acc;
}

function sorter(a: string[], b: string[]): number {
  if (a.length > b.length) {
    return 1;
  } else if (b.length > a.length) {
    return -1;
  }

  const aStr = a.join('/');
  const bStr = b.join('/');

  if (aStr > bStr) {
    return 1;
  } else if (bStr > aStr) {
    return -1;
  }

  return 0;
}

/** @internal */
export function getChangedPaths(diff: Operation[]): null | string[][] {
  if (!diff.length) {
    return null;
  }

  const out: string[][] = Object.values(diff.reduce(getChangedPathsReducer, {}));
  out.sort(sorter);

  return out.length ? out : null;
}
