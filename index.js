/* @flow */

import { parse } from 'babylon';
import wrap from './lib/transform';

export default function(input: string, limit: number): string {
  const ast = parse(input, { sourceType: 'module', plugins: '*' }).program.body[0];
  const output = wrap(ast, limit);
  return Array.from(output).join('');
}
