/* @flow */

export function* product<T>(...iterables: Array<Iterable<T>>): Iterable<Array<T>> {
  if (!iterables.length) {
    return;
  }
  const [first, ...rest] = iterables;
  for (const value of first) {
    if (rest.length) {
      for (const other of product(...rest)) {
        yield [value, ...other];
      }
    } else {
      yield [value];
    }
  }
}
