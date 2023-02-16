#!/usr/bin/env node

const fin = require('../lib/finance');
const tsv = require('../lib/tsv');

const alfa = require('../lib/parser/alfa');
const tbc = require('../lib/parser/tbc');
const tinkoff = require('../lib/parser/tinkoff');

const parsers = {
  alfa: [alfa.parse, alfa.report],
  tbc: [tbc.parse, tbc.report],
  tinkoff: [tinkoff.parse, tinkoff.report],
};

async function main() {
  const name = process.argv[2];
  const path = process.argv[3];
  const mode = process.argv[4];

  if (!path) {
    throw new Error('Path to file is required');
  }

  if (!parsers[name]) {
    throw new Error(`Unknown parser ${name}`);
  }

  const [parse, report] = parsers[name];
  const [header, records] = await parse(path);

  if (mode === '-r') {
    console.log(fin.makeReport(records, report));
  } else {
    tsv.print(header, records);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
