const Decimal = require('decimal.js');
const numeral = require('numeral');

const CURRENCIES = [
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
  { str: 'RUR', code: 'RUB' },
  { str: 'EUR', code: 'EUR' },
];

function makeReport(data, fn) {
  const income = {};
  const outcome = {};

  for (const record of data) {
    const [amount, currency] = fn(record);

    if (!income[currency]) {
      income[currency] = new Decimal(0);
    }
    if (!outcome[currency]) {
      outcome[currency] = new Decimal(0);
    }

    const value = new Decimal(amount);

    if (value > 0) {
      income[currency] = income[currency].add(value);
    } else {
      outcome[currency] = outcome[currency].add(value);
    }
  }

  return [income, outcome];
}

function findCurrency(value) {
  const currency = CURRENCIES.find((c) => c.str === value);

  if (!currency) {
    throw new Error(`Unknown currency: ${value}`);
  }

  return currency.code;
}

function checkCurrency(value) {
  return CURRENCIES.map((c) => c.str).includes(value);
}

function formatAmount(value) {
  return numeral(value).format('+0.00');
}

module.exports = {
  makeReport,
  findCurrency,
  checkCurrency,
  formatAmount,
};
