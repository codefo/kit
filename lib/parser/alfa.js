const path = require('path');
const dt = require('../datetime');
const pdf = require('../pdf');
const fin = require('../finance');

const HEADER = [
  'Timestamp 1',
  'Timestamp 2',
  'Amount',
  'Currency',
  'Details',
];

const DATE_REGEX_1 = /^(\d{2})\.(\d{2})\.(\d{4})$/;
const DATE_REGEX_2 = /^(\d{2})\.(\d{2})\.(\d{2})$/;
const DATE_FORMATS = ['dd.MM.yyyy', 'dd.MM.yy'];

const AMOUNT_REGEX_1 = /^(-)?([\d\W]*),(\d{2})\W(RUR|EUR)$/;
const AMOUNT_REGEX_2 = /^(-)?([\d\W]*)\.(\d{2})$/;

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
  const first = line.shift();
  const last = line.pop();
  const rest = line.join(' ').split(' ');

  let date1;
  const date2 = dt.parseDate(first, DATE_FORMATS);
  const amount = fin.getAmount(last.slice(0, last.length - 4).replace(/,/g, '.'));
  const currency = fin.getCurrency(last.slice(last.length - 3));

  const len = rest.length;

  if (len > 4) {
    let dateX = rest[len - 4];
    let dateY = rest[len - 3];

    const isDateX = Boolean(dateX.match(DATE_REGEX_2));
    const isDateY = Boolean(dateY.match(DATE_REGEX_2));
    const isAmount = Boolean(rest[len - 2].match(AMOUNT_REGEX_2));
    const isCurrency = fin.checkIsCurrency(rest[len - 1]);

    if (isDateX && isDateY && isAmount && isCurrency) {
      dateX = dt.parseDate(dateX, DATE_FORMATS);
      dateY = dt.parseDate(dateY, DATE_FORMATS);
      date1 = dateX > dateY ? dateY : dateX;
    }
  }

  return [
    date1 ? date1.toISODate() : date2.toISODate(),
    date2.toISODate(),
    amount,
    currency,
    rest.join(' '),
  ];
}

async function parse(filePath) {
  if (path.extname(filePath) !== '.pdf') {
    throw new Error('File is not a PDF');
  }

  const data = await pdf.parseFile(filePath);
  const records = extract(data).map(transform);

  return [
    HEADER,
    records,
  ];
}

module.exports = {
  parse,
  report: (record) => [record[2], record[3]],
};
