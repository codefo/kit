import * as path from 'path';

import * as dt from '../datetime';
import * as fin from '../finance';
import * as pdf from '../pdf';

const HEADER = ['Timestamp 1', 'Timestamp 2', 'Amount 1', 'Currency 1', 'Amount 2', 'Currency 2', 'Details', 'Card'];

const TIMEZONE = 'Europe/Moscow';
const DATETIME_FORMATS = ['dd.MM.yyyy HH:mm:ss', 'dd.MM.yyyy HH:mm'];
const DATETIME_REGEX = /^(\d{2})\.(\d{2})\.(\d{4}) (\d{2}):(\d{2})(:(\d{2}))?$/;

function extract(data): string[][] {
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

function transform(line): string[] {
  let result = [];

  let index = 0;

  for (let i = 0; i < 2; i++) {
    const datetime = dt.parseDateTime(line[index++], TIMEZONE, DATETIME_FORMATS);

    result.push(datetime.toISO({ suppressMilliseconds: true }));
  }

  if (result[0] > result[1]) {
    result = [result[1], result[0]];
  }

  for (let i = 0; i < 2; i++) {
    let amount;
    let currency;

    const value = line[index];

    const isCurrencyIncluded = fin.checkIsCurrencyIncluded(value);

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

    result.push(fin.getAmount(amount));
    result.push(fin.getCurrency(currency));
  }

  result.push(line.slice(index, line.length - 1).join(' '));

  result.push(line[line.length - 1].length < 4 ? 'N/A' : line[line.length - 1]);

  return result;
}

export async function parse(filePath: string) {
  if (path.extname(filePath) !== '.pdf') {
    throw new Error('File is not a PDF');
  }

  const data = await pdf.parseFile(filePath);
  const records = extract(data).map(transform);

  return [HEADER, ...records];
}

export const report = (record: string[]) => [record[4], record[5]];
