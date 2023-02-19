import { XMLParser } from 'fast-xml-parser';
import fs from 'fs';

export function parseFile(path: string) {
  const parser = new XMLParser();
  const xml = fs.readFileSync(path, 'utf8');
  return parser.parse(xml);
}
