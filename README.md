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

## License

[The Unlicense](UNLICENSE)
