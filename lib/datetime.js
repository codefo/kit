const { DateTime } = require('luxon');

function parseDate(str, formats) {
  for (const format of formats) {
    const date = DateTime.fromFormat(str, format);

    if (date.isValid) {
      return date;
    }
  }

  throw new Error(`Invalid date: ${str} ${formats}`);
}

function parseDateTime(str, timezone, formats) {
  for (const format of formats) {
    const datetime = DateTime.fromFormat(str, format, { zone: timezone });

    if (datetime.isValid) {
      return datetime.setZone('UTC');
    }
  }

  throw new Error(`Invalid datetime: ${str} ${formats}`);
}

module.exports = {
  parseDate,
  parseDateTime,
};
