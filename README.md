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

### `bin/merge-tsv`

This tool merges multiple [.tsv](https://en.wikipedia.org/wiki/Tab-separated_values) files into one

```sh
$ npx ts-node ./bin/merge-tsv.ts "./path/to/*.tsv" [-s] > ./merged.tsv
```
> `[-s]` flag is optional and is used to sort the result by first column.

### `bin/parse-bs`

This tool parses bank statements from different banks ([Alfa-Bank](https://alfabank.ru/), [TBC Bank](https://www.tbcbank.ge/), [Tinkoff Bank](https://www.tinkoff.ru/)) and outputs a [.tsv](https://en.wikipedia.org/wiki/Tab-separated_values) file

```sh
$ npx ts-node ./bin/parse-bs.ts <bank> ./statement.file [-r] > ./statements.tsv
```
> `<bank>` parameter can be one of the following: `alfa`, `tbc` or `tinkoff`.
>
> `[-r]` flag is optional and is used to create a overall report for the parsed statements in `JSON` format.

### `bin/find-rss`

This tool finds RSS feeds in HTML pages

```sh
$ npx ts-node ./bin/find-rss.ts https://www.nytimes.com/
```

## License

[The Unlicense](UNLICENSE)
