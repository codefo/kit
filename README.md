# kit

A bunch of tools that help me with various tasks

## Requirements

- [GNU Make](https://www.gnu.org/software/make/)
- [node.js](https://nodejs.org/en/)

## Installation

```sh
$ make install
```

## Usage

#### `bin/parse-tinkoff`

This tool parses a PDF statement from [Tinkoff Bank](https://www.tinkoff.ru/) and outputs a [.tsv](https://en.wikipedia.org/wiki/Tab-separated_values) file

```sh
$ node ./bin/parse-tinkoff.js ./statement.pdf > ./statement.tsv
```

#### `bin/merge-tsv`

This tool merges multiple [.tsv](https://en.wikipedia.org/wiki/Tab-separated_values) files into one, and sorts the result by first column if `-s` flag is provided

```sh
$ node ./bin/merge-tsv.js "./path/to/*.tsv" -s > ./merged.tsv
```

#### `bin/parse-tbc`

This tool parses an XML statement from [TBC Bank](https://www.tbcbank.ge/) and outputs a [.tsv](https://en.wikipedia.org/wiki/Tab-separated_values) file

```sh
$ node ./bin/parse-tbc.js ./statement.xml > ./statement.tsv
```

## License

[The Unlicense](UNLICENSE)
