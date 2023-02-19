#!/usr/bin/env ts-node

import * as fin from '../lib/finance';
import * as alfa from '../lib/parser/alfa';
import * as tbc from '../lib/parser/tbc';
import * as tinkoff from '../lib/parser/tinkoff';
import * as tsv from '../lib/tsv';

const parsers: Record<string, [(path: string) => Promise<string[][]>, (record: string[]) => string[]]> = {
  alfa: [alfa.parse, alfa.report],
  tbc: [tbc.parse, tbc.report],
  tinkoff: [tinkoff.parse, tinkoff.report],
};

async function main() {
  const name: string = process.argv[2];
  const path: string = process.argv[3];
  const mode: string = process.argv[4];

  if (!path) {
    throw new Error('Path to file is required');
  }

  if (!parsers[name]) {
    throw new Error(`Unknown parser ${name}`);
  }

  const [parse, report] = parsers[name];
  const [header, ...records] = await parse(path);

  if (mode === '-r') {
    fin.printReport(records, report);
  } else {
    tsv.print(header, records);
  }
}

void main();
