/* @flow */
import fs from 'fs';
import path from 'path';
// eslint-disable-next-line
import glob from 'glob';

const FIXTURE_ROOT = path.join(__dirname, 'fixtures');

type Command = 'input' | 'expect';
type Attributes = {[string]: ?string};

class Directive {
  command: Command;
  attributes: Attributes;

  constructor(command: Command, attributes: Attributes) {
    this.command = command;
    this.attributes = attributes;
  }
}

class Block {
  directive: Directive;
  contents: Array<string>;

  constructor(directive: Directive) {
    this.directive = directive;
    this.contents = [];
  }

  append(str: string) {
    this.contents.push(str);
  }

  toString(): string {
    return this.contents.join('\n');
  }
}

class Fixture {
  filename: string;
  input: Block;
  expected: Array<Block>;

  constructor(filename: string, iterator: Iterable<Block>) {
    const blocks = Array.from(iterator);
    this.filename = filename;
    const input = blocks.find(b => b.directive.command === 'input');
    if (!input) {
      throw Error(`Missing input in fixture: ${this.filename}`);
    } else {
      this.input = input;
    }
    this.expected = blocks.filter(b => b.directive.command === 'expect');
  }
}

export function getFixtures() {
  return glob.sync('**/*.js', {
    cwd: FIXTURE_ROOT,
  });
}

function* readLines(data) {
  for (const line of data.split('\n')) {
    yield line;
  }
}

function parseDirective(line: string): ?Directive {
  const match = /^\/\/\s*@(\w+)\b(.*)$/g.exec(line);
  if (!match) {
    return match;
  }

  const command = match[1];
  const attributeString = match[2];
  const attributes = {};
  const attributeRegex = /\b(\w+)\b(?:=\b(\w+)\b)?/g;
  let m = null;
  // eslint-disable-next-line
  while ((m = attributeRegex.exec(attributeString)) !== null) {
    attributes[m[1]] = m[2];
  }
  return new Directive(command, attributes);
}

function* parseBlocks(lines: Iterable<string>): Iterable<Block> {
  let block = null;

  for (const line of lines) {
    const directive = parseDirective(line);
    if (directive) {
      if (block) {
        yield block;
      }
      block = new Block(directive);
    } else {
      if (!block) {
        throw Error('Missing directive');
      }
      block.append(line);
    }
  }
  if (block) {
    yield block;
  }  
}

export function parseFixture(filename: string): Fixture {
  const data = fs.readFileSync(path.join(FIXTURE_ROOT, filename), 'utf8');
  return new Fixture(filename, parseBlocks(readLines(data)));
}
