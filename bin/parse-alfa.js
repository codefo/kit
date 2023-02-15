#!/usr/bin/env node

const dt = require('../lib/datetime');
const pdf = require('../lib/pdf');
const tsv = require('../lib/tsv');
const finance = require('../lib/finance');

const HEADER = [
  'Timestamp 1',
  'Timestamp 2',
  'Amount',
  'Currency',
  'Details',
];

const DATE_REGEX_1 = /^(\d{2})\.(\d{2})\.(\d{4})$/;
const DATE_REGEX_2 = /^(\d{2})\.(\d{2})\.(\d{2})$/;
const DATE_FORMAT_1 = 'dd.MM.yyyy';
const DATE_FORMAT_2 = 'dd.MM.yy';
const DATE_FORMATS = [DATE_FORMAT_1, DATE_FORMAT_2];

const AMOUNT_REGEX_1 = /^(-)?([\d\W]*),(\d{2})\W(RUR|EUR)$/;
const AMOUNT_REGEX_2 = /^(-)?([\d\W]*)\.(\d{2})$/;

function parseAmount(str) {
  const first = str.slice(0, str.length - 4).replace(/,/g, '.');
  const last = str.slice(str.length - 3);

  return [
    finance.formatAmount(first),
    finance.findCurrency(last),
  ];
}

function extract(data) {
  const result = [];

  for (const page of data.pages) {
    let line = [];
    let isPageStarted = false;

    for (const item of page.content) {
      const value = item.str.trim();

      if (!value) {
        continue;
      }

      const isDateTime = Boolean(value.match(DATE_REGEX_1));
      const isFirstElement = item.x < 30;
      const isLastElementAmount = line.length > 0
        ? Boolean(line[line.length - 1].match(AMOUNT_REGEX_1))
        : false;
      const isEndOfLine = isLastElementAmount && isFirstElement;

      if (isEndOfLine) {
        if (line.length) {
          result.push(line);
        }
        isPageStarted = false;
        line = [];
      }

      if (isDateTime && isFirstElement) {
        isPageStarted = true;
      }

      if (isPageStarted) {
        line.push(value);
      }
    }

    result.push(line);
  }

  return result;
}

function transform(line) {
  const date1 = dt.parseDate(line.shift(), DATE_FORMATS);
  const [amount, currency] = parseAmount(line.pop());
  const details = line.join(' ').split(' ');

  let date2;
  const l = details.length;

  if (l > 4) {
    let dateX = details[l - 4];
    let dateY = details[l - 3];

    const isDateX = Boolean(dateX.match(DATE_REGEX_2));
    const isDateY = Boolean(dateY.match(DATE_REGEX_2));
    const isAmount = Boolean(details[l - 2].match(AMOUNT_REGEX_2));
    const isCurrency = finance.checkCurrency(details[l - 1]);

    if (isDateX && isDateY && isAmount && isCurrency) {
      dateX = dt.parseDate(dateX, DATE_FORMATS);
      dateY = dt.parseDate(dateY, DATE_FORMATS);
      date2 = dateX > dateY ? dateY : dateX;
    }
  }

  return [
    date1.toISODate(),
    date2 ? date2.toISODate() : '',
    amount,
    currency,
    details.join(' '),
  ];
}

async function main() {
  const path = process.argv[2];
  const mode = process.argv[3];

  if (!path) {
    throw new Error('Path to file is required');
  }

  const data = await pdf.parseFile(path);
  const records = extract(data).map(transform);

  if (mode === '-c') {
    console.log(finance.makeReport(records, (record) => [record[2], record[3]]));
  } else {
    tsv.print(HEADER, records);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
