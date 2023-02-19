#!/usr/bin/env ts-node

import fs from 'fs';
import glob from 'glob';

import * as tsv from '../lib/tsv.js';

function main() {
  const pattern = process.argv[2];
  const sort = process.argv[3];
  const files = glob.sync(pattern);

  let header;
  let result = [];

  for (const file of files) {
    const content = fs.readFileSync(file, 'utf8');
    const [h, ...lines] = content.split('\n');

    if (!header) {
      header = h;
    } else if (header !== h) {
      throw new Error(`Header mismatch in ${file}`);
    }

    result.push(...lines.filter((l) => l.length > 0).map((l) => l.split('\t')));
  }

  if (sort) {
    result = [
      ...result.sort((a, b) => {
        if (a[0] > b[0]) return 1;
        if (a[0] < b[0]) return -1;
        return 0;
      }),
    ];
  }

  tsv.print(header, result);
}

main();
