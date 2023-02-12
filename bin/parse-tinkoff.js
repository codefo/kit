#!/usr/bin/env node

/* eslint-disable no-console */
/* eslint-disable no-plusplus */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-continue */

const { PDFExtract } = require('pdf.js-extract');
const { DateTime } = require('luxon');
const numeral = require('numeral');
const Decimal = require('decimal.js');

const pdfExtract = new PDFExtract();

const DELIMITER = '\t';

const HEADER = [
  'Timestamp 1',
  'Timestamp 2',
  'Amount 1',
  'Currency 1',
  'Amount 2',
  'Currency 2',
  'Details',
  'Card',
];

const TIMEZONE = 'Europe/Moscow';
const DATETIME_FORMAT_1 = 'dd.MM.yyyy HH:mm:ss';
const DATETIME_FORMAT_2 = 'dd.MM.yyyy HH:mm';
const DATETIME_REGEX = /^(\d{2})\.(\d{2})\.(\d{4}) (\d{2}):(\d{2})(:(\d{2}))?$/;

const CURRENCIES_MAP = [
  { str: '₽', code: 'RUB' },
  { str: '$', code: 'USD' },
  { str: '€', code: 'EUR' },
  { str: '£', code: 'GBP' },
  { str: '₺', code: 'TRY' },
  { str: '₾', code: 'GEL' },
  { str: 'Ft', code: 'HUF' },
  { str: 'zł', code: 'PLN' },
  { str: 'Kč', code: 'CZK' },
  { str: 'лв', code: 'BGN' },
  { str: 'kr', code: 'SEK' },
  { str: 'Br', code: 'BYN' },
  { str: 'DKK', code: 'DKK' },
  { str: 'NKr', code: 'NOK' },
];

function parseFile(path) {
  return new Promise((resolve, reject) => {
    pdfExtract.extract(path, {}, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
}

function parseDateTime(str) {
  let datetime = DateTime.fromFormat(str, DATETIME_FORMAT_1, { zone: TIMEZONE });

  if (!datetime.isValid) {
    datetime = DateTime.fromFormat(str, DATETIME_FORMAT_2, { zone: TIMEZONE });
  }

  return datetime.setZone('UTC');
}

function parseAmount(str) {
  return numeral(str).format('+0.00');
}

function parseCurrency(str) {
  const currency = CURRENCIES_MAP.find((item) => str.includes(item.str));

  if (!currency) {
    throw new Error(`Unknown currency: ${str}`);
  }

  return currency.code;
}

function extract(data) {
  const result = [];

  for (const page of data.pages) {
    let line = [];
    let isPageStarted = false;
    let lastX;

    for (const item of page.content) {
      const value = item.str.trim();

      if (!value) {
        continue;
      }

      const isDateTime = Boolean(value.match(DATETIME_REGEX));
      const isEndOfLine = lastX && item.x < lastX;

      if (isEndOfLine) {
        lastX = item.x;
        if (line.length) {
          result.push(line);
        }
        isPageStarted = false;
        line = [];
      }

      if (isDateTime) {
        isPageStarted = true;
      }

      if (isPageStarted) {
        line.push(value);
        lastX = item.x;
      }
    }
  }

  return result;
}

function transform(line) {
  let result = [];

  let index = 0;

  for (let i = 0; i < 2; i++) {
    result.push(parseDateTime(line[index++]).toISO({ suppressMilliseconds: true }));
  }

  if (result[0] > result[1]) {
    result = [result[1], result[0]];
  }

  for (let i = 0; i < 2; i++) {
    let amount;
    let currency;

    const value = line[index];

    const isCurrencyIncluded = CURRENCIES_MAP.some((c) => value.includes(c.str));

    if (isCurrencyIncluded) {
      const lastIndex = value.lastIndexOf(' ');
      amount = line[index].slice(0, lastIndex);
      currency = line[index++].slice(lastIndex + 1);
    } else {
      amount = line[index++];
      currency = line[index++];
    }

    if (!['+', '-'].includes(amount[0])) {
      amount = `-${amount}`;
    }

    result.push(parseAmount(amount));
    result.push(parseCurrency(currency));
  }

  result.push(line.slice(index, line.length - 1).join(' '));

  result.push(line[line.length - 1].length < 4 ? 'N/A' : line[line.length - 1]);

  return result;
}

function check(lines) {
  let income = new Decimal(0);
  let expences = new Decimal(0);

  for (const line of lines) {
    const amount = new Decimal(line[4]);

    if (amount > 0) {
      income = income.plus(amount);
    } else {
      expences = expences.plus(amount);
    }
  }

  console.log(`Income: ${income}`);
  console.log(`Expences: ${expences}`);
}

function print(lines) {
  console.log(HEADER.join(DELIMITER));

  for (const line of lines) {
    console.log(line.join(DELIMITER));
  }
}

async function main() {
  const path = process.argv[2];
  const mode = process.argv[3];

  if (!path) {
    throw new Error('Path to file is required');
  }

  const data = await parseFile(path);
  const lines = extract(data).map(transform);

  if (mode === '-c') {
    check(lines);
  } else {
    print(lines);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
