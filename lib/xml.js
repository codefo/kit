const fs = require('fs');
const { XMLParser } = require('fast-xml-parser');

function parseFile(path) {
  const parser = new XMLParser();
  const xml = fs.readFileSync(path, 'utf8');
  return parser.parse(xml);
}

module.exports = {
  parseFile,
};
