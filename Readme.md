# eswrap

[![npm version](https://badge.fury.io/js/eswrap.svg)](https://badge.fury.io/js/eswrap)
[![Build Status](https://travis-ci.org/kevinastone/eswrap.svg?branch=master)](https://travis-ci.org/kevinastone/eswrap)

eswrap is a ecmascript formatting utlity.  It will parse a supplied block of code and apply formatting to attempt to fit it within a col width.

```
echo "[variable1, variable2, variable3]" | eswrap --limit 20
[
  variable1,
  variable2,
  variable3,
]
```
