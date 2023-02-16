#!/usr/bin/env node

const xml = require('../lib/xml');
const dt = require('../lib/datetime');
const fin = require('../lib/finance');
const tsv = require('../lib/tsv');

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
const DATE_FORMATS = ['dd/MM/yyyy'];
const DATE_TIME_FORMATS = ['MMM d yyyy h:mma'];
const DATE_TIME_REGEXP = /(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\W*(\d{1,2})\W*(\d{4})\W*(\d{1,2}:\d{2})(AM|PM)/;

const AMOUNT_REGEX = /თანხა (\d+\.\d{2}) ([A-Z]{3})/;

function extract(data) {
  const records = data['gemini:TransactionsHistory']['gemini:Record'];

  const result = [];

  for (const record of records) {
    const date1 = record['gemini:DocumentDate'];
    const date2 = record['gemini:Date'];
    const amount1 = record['gemini:Amount'];
    const currency1 = record['gemini:Currency'];
    const details = record['gemini:Description'];
    const operationCode = record['gemini:OperationCode'];

    let dateTime1;
    let amount2;
    let currency2;

    const dateTimeMatch = details.match(DATE_TIME_REGEXP);
    const amountMatch = details.match(AMOUNT_REGEX);

    if (dateTimeMatch) {
      dateTime1 = dateTimeMatch[0].replaceAll('  ', ' ');
    }

    if (amountMatch) {
      [, amount2, currency2] = amountMatch;
    }

    result.push({
      date1,
      date2,
      dateTime1,
      amount1,
      currency1,
      amount2,
      currency2,
      details,
      operationCode,
    });
  }

  return result;
}

function transform(record) {
  const {
    date1,
    date2,
    dateTime1,
    amount1,
    currency1,
    currency2,
    details,
    operationCode,
  } = record;

  let { amount2 } = record;

  if (amount2 && amount1[0] === '-') {
    amount2 = `-${amount2.slice(1)}`;
  }

  return [
    dateTime1
      ? dt.parseDateTime(dateTime1, TIMEZONE, DATE_TIME_FORMATS)
        .toISO({ suppressMilliseconds: true, suppressSeconds: true })
      : dt.parseDate(date1, DATE_FORMATS).toISODate(),
    date2 ? dt.parseDate(date2, DATE_FORMATS).toISODate() : '',
    fin.getAmount(amount1),
    fin.getCurrency(currency1),
    fin.getAmount(amount2),
    currency2 ? fin.getCurrency(currency2) : '',
    details,
    operationCode,
  ];
}

function main() {
  const file = process.argv[2];
  const mode = process.argv[3];

  const data = xml.parseFile(file);
  const records = extract(data).map(transform);

  if (mode === '-r') {
    console.log(fin.makeReport(records, (record) => [record[2], record[3]]));
  } else {
    tsv.print(HEADER, records);
  }
}

main();
