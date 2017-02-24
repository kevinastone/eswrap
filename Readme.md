# eswrap

[![npm version](https://badge.fury.io/js/eswrap.svg)](https://badge.fury.io/js/eswrap)
[![Build Status](https://travis-ci.org/kevinastone/eswrap.svg?branch=master)](https://travis-ci.org/kevinastone/eswrap)

**eswrap** is an ECMAScript formatting utility.
It attempts to reformat a code block to fit within a specified column count:

```bash
echo "[variable1, variable2, variable3];" | eswrap --limit 20

# Output:
'[
  variable1,
  variable2,
  variable3,
];'
```
