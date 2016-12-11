/* eslint-disable */
import babel from 'rollup-plugin-babel';

export default {
  entry: './cli.js',
  dest: 'bin/eswrap.js',
  format: 'cjs',
  banner: '#!/usr/bin/env node ',
  plugins: [
    babel({
      babelrc: false,
      presets: [
        ["es2015", {
          "modules": false
        }],
      ],
      "plugins": [
        "transform-flow-strip-types",
        "transform-runtime",
        "inline-package-json"
      ],
      exclude: 'node_modules/**',
      runtimeHelpers: true,
    }),
  ],
};
