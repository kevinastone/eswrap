// @input
type Generator<T> = () => Iterable<T>;
export function* product<T>(...iterables: Array<Generator<T>>): Iterable<Array<T>> {}
// @expect length=80
type Generator<T> = () => Iterable<T>;
export function* product<T>(...iterables: Array<Generator<T>>)
  : Iterable<Array<T>> {}
