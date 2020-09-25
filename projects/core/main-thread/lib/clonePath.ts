/** @internal */
export function clonePath<T>(obj: T, path: string[]): T {
  let parent: any;
  let value: any = obj;
  for (let i = 0; i < path.length; i++) {
    parent = value;
    value = value[path[i]];
  }

  if (value && typeof value === 'object') {
    const lastSegment = path[path.length - 1];
    parent[lastSegment] = Array.isArray(value) ? value.slice() : {...value};
  }

  return obj;
}
