import { DateTime } from 'luxon';

export function parseDate(str: string, formats: string[]) {
  for (const format of formats) {
    const date = DateTime.fromFormat(str, format);

    if (date.isValid) {
      return date;
    }
  }

  throw new Error(`Invalid date: ${str} ${formats}`);
}

export function parseDateTime(str: string, timezone: string, formats: string[]) {
  for (const format of formats) {
    const datetime = DateTime.fromFormat(str, format, { zone: timezone });

    if (datetime.isValid) {
      return datetime.setZone('UTC');
    }
  }

  throw new Error(`Invalid datetime: ${str} ${formats}`);
}
