const DELIMITER = '\t';

export function print(header: string[], lines: string[][]) {
  console.log(header.join(DELIMITER));

  for (const line of lines) {
    console.log(line.join(DELIMITER));
  }
}
