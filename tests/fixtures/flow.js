// @input
type Generator<T> = () => Iterable<T>;
export function* product<T>(...iterables: Array<Generator<T>>): Iterable<Array<T>> {}
// @expect length=80 skip # need to fix solve order
type Generator<T> = () => Iterable<T>;
export function* product<T>(...iterables: Array<Generator<T>>)
  : Iterable<Array<T>> {}
