/* @flow */

import { parse } from 'babylon';
import wrap from './lib/index';

export default function(input: string, limit: number): string {
  const ast = parse(input, { sourceType: 'module', plugins: '*' }).program;
  const output = wrap(ast, limit);
  return Array.from(output).join('');
}
