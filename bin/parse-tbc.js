#!/usr/bin/env node

/* eslint-disable no-console */
/* eslint-disable no-restricted-syntax */

const fs = require('fs');
const { XMLParser } = require('fast-xml-parser');
const { DateTime } = require('luxon');
const numeral = require('numeral');
const Decimal = require('decimal.js');

const DELIMITER = '\t';

const HEADER = [
  'Timestamp 1',
  'Timestamp 2',
  'Amount 1',
  'Currency 1',
  'Amount 2',
  'Currency 2',
  'Details',
  'Operation Code',
];

const TIMEZONE = 'Asia/Tbilisi';
const DATE_FORMAT = 'dd/MM/yyyy';
const DATE_TIME_FORMAT = 'MMM d yyyy h:mma';
const DATE_TIME_REGEXP = /(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\W*(\d{1,2})\W*(\d{4})\W*(\d{1,2}:\d{2})(AM|PM)/;

const AMOUNT_REGEX = /თანხა (\d+\.\d{2}) ([A-Z]{3})/;

const CURRENCIES = ['GEL', 'USD', 'EUR', 'TRY', 'RSD'];

const parser = new XMLParser();

function parseDate(str) {
  return DateTime.fromFormat(str, DATE_FORMAT, { zone: TIMEZONE });
}

function findDateTime(str) {
  const match = str.match(DATE_TIME_REGEXP);

  if (match) {
    const matched = match[0].replaceAll('  ', ' ');
    const result = DateTime.fromFormat(matched, DATE_TIME_FORMAT, { zone: TIMEZONE });

    return result.setZone('UTC');
  }

  return null;
}

function parseAmount(str) {
  return numeral(str).format('+0.00');
}

function findAmount(str) {
  const match = str.match(AMOUNT_REGEX);

  if (match) {
    const amount = parseAmount(match[1]);
    const currency = match[2];

    if (!CURRENCIES.includes(currency)) {
      throw new Error(`Unknown currency: ${currency}`);
    }

    return [amount, currency];
  }

  return [];
}

function parseFile(file) {
  const xml = fs.readFileSync(file, 'utf8');
  const data = parser.parse(xml);
  const records = data['gemini:TransactionsHistory']['gemini:Record'];

  const result = [];

  for (const record of records) {
    const date1 = parseDate(record['gemini:DocumentDate']);
    const date2 = parseDate(record['gemini:Date']);
    const amount1 = parseAmount(record['gemini:Amount']);
    const currency1 = record['gemini:Currency'];
    const details = record['gemini:Description'];
    const operationCode = record['gemini:OperationCode'];

    const dateTime1 = findDateTime(record['gemini:Description']);
    const [amount2, currency2] = findAmount(record['gemini:Description']);

    result.push({
      amount1, currency1, amount2, currency2, details, date1, date2, dateTime1, operationCode,
    });
  }

  return result;
}

function check(data) {
  const income = {};
  const expences = {};

  for (const record of data) {
    if (!income[record.currency1]) {
      income[record.currency1] = new Decimal(0);
    }
    if (!expences[record.currency1]) {
      expences[record.currency1] = new Decimal(0);
    }

    const value = new Decimal(record.amount1);

    if (value > 0) {
      income[record.currency1] = income[record.currency1].add(value);
    } else {
      expences[record.currency1] = expences[record.currency1].add(value);
    }
  }

  console.log(income);
  console.log(expences);
}

function print(data) {
  console.log(HEADER.join(DELIMITER));

  for (const record of data) {
    const {
      amount1, currency1, currency2, details, date1, date2, dateTime1, operationCode,
    } = record;

    let { amount2 } = record;

    if (amount2 && amount1[0] === '-') {
      amount2 = `-${amount2.slice(1)}`;
    }

    const line = [
      dateTime1
        ? dateTime1.toISO({ suppressMilliseconds: true, suppressSeconds: true })
        : date1.toISODate(),
      date2 ? date2.toISODate() : '',
      amount1,
      currency1,
      amount2,
      currency2,
      details,
      operationCode,
    ];

    console.log(line.join(DELIMITER));
  }
}

function main() {
  const file = process.argv[2];
  const mode = process.argv[3];

  const data = parseFile(file);

  if (mode === '-c') {
    check(data);
  } else {
    print(data);
  }
}

main();
