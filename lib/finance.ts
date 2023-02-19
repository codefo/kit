import Decimal from 'decimal.js';
import fs from 'fs';
import yaml from 'js-yaml';
import numeral from 'numeral';
import path from 'path';

const cfg = yaml.load(fs.readFileSync(path.join(__dirname, '../cfg/finance.yaml'), 'utf8'));

const CURRENCIES = cfg.currency.map((c) => c.values.map((v) => ({ str: v, code: c.code }))).flat();

export function makeReport(data: string[][], fn: (record: string[]) => string[]) {
  const income = {};
  const outcome = {};

  const zero = new Decimal(0);

  for (const record of data) {
    const [amount, currency] = fn(record);

    if (!income[currency]) {
      income[currency] = new Decimal(0);
    }
    if (!outcome[currency]) {
      outcome[currency] = new Decimal(0);
    }

    const value = new Decimal(amount);

    if (value.comparedTo(zero) > 0) {
      income[currency] = income[currency].add(value);
    } else {
      outcome[currency] = outcome[currency].add(value);
    }
  }

  return [income, outcome];
}

export function printReport(data: string[][], fn: (record: string[]) => string[]) {
  const [income, outcome] = makeReport(data, fn);

  console.log('Income:', income);
  console.log('Outcome:', outcome);
}

export function getAmount(value: string) {
  return numeral(value).format('+0.00');
}

export function getCurrency(value: string) {
  const currency = CURRENCIES.find((c) => c.str === value);

  if (!currency) {
    throw new Error(`Unknown currency: ${value}`);
  }

  return currency.code;
}

export function checkIsCurrency(value: string) {
  return CURRENCIES.map((c) => c.str).includes(value);
}

export function checkIsCurrencyIncluded(value: string) {
  return CURRENCIES.some((c) => value.includes(c.str));
}
