/* @flow */

type Generator<T> = () => Iterable<T>;

export function* product<T>(...iterables: Array<Generator<T>>): Iterable<Array<T>> {
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
