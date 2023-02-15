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

module.exports = {
  parseDate,
};
