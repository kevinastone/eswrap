import fs from 'fs';
import program from 'commander';
import format from './index';

const version = require('./package.json').version;

const DEFAULT_LINE_LENGTH = 80;

program
  .version(version)
  .description('format ECMAScript code')
  .option(
    '-l, --limit <cols>',
    `line limit (defaults to ${DEFAULT_LINE_LENGTH})`,
    parseInt,
  )
  .arguments('[<input>]')
  ;

program.parse(process.argv);

const stream = program.args.length
  ? fs.createReadStream(program.args[0])
  : process.stdin;


stream.setEncoding('utf8');
let input = '';
stream.on('data', (buf) => { input += buf.toString(); });
stream.on('end', () => {
  process.stdout.write(format(input, program.limit || DEFAULT_LINE_LENGTH));
});
