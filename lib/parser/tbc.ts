import * as path from 'path';

import * as dt from '../datetime';
import * as fin from '../finance';
import * as xml from '../xml';

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
const DATE_TIME_REGEXP =
  /(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\W*(\d{1,2})\W*(\d{4})\W*(\d{1,2}:\d{2})(AM|PM)/;

const AMOUNT_REGEX = /თანხა (\d+\.\d{2}) ([A-Z]{3})/;

function extract(data): string[][] {
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

function transform(record): string[] {
  const { date1, date2, dateTime1, amount1, currency1, currency2, details, operationCode } = record;

  let { amount2 } = record;

  if (amount2 && amount1[0] === '-') {
    amount2 = `-${amount2.slice(1)}`;
  }

  return [
    dateTime1
      ? dt
          .parseDateTime(dateTime1, TIMEZONE, DATE_TIME_FORMATS)
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

export async function parse(filePath) {
  if (path.extname(filePath) !== '.xml') {
    throw new Error('File is not a XML');
  }

  const data = xml.parseFile(filePath);
  const records = extract(data).map(transform);

  const result = [HEADER, ...records];

  return Promise.resolve(result);
}

export const report = (record) => [record[2], record[3]];
