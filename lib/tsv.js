const DELIMITER = '\t';

function print(header, lines) {
  console.log(header.join(DELIMITER));

  for (const line of lines) {
    console.log(line.join(DELIMITER));
  }
}

module.exports = {
  print,
};
