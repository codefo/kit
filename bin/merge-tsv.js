#!/usr/bin/env node

/* eslint-disable no-console */
/* eslint-disable no-restricted-syntax */

const fs = require('fs');
const glob = require('glob');

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

  console.log(header);
  console.log(result.map((l) => l.join('\t')).join('\n'));
}

main();
