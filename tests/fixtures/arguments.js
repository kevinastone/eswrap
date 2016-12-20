// @input
myFunc('something', { key: 'value' }, [1, 2, 3, 4, 5], callAnotherFunc(1, 2));

// @expect length=80
myFunc('something', { key: 'value' }, [1, 2, 3, 4, 5], callAnotherFunc(1, 2));

// @expect length=40
myFunc(
  'something',
  { key: 'value' },
  [1, 2, 3, 4, 5],
  callAnotherFunc(1, 2),
);
