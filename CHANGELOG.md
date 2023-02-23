# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.6.0] - 2023-02-24

### Added

- Added [Brewfile](etc/Brewfile) with dependencies.

## [0.5.2] - 2023-02-19

### Added

- Added configuration.

## [0.5.1] - 2023-02-19

### Added

- Added [tool](bin/find-rss.ts) to find RSS feeds in HTML pages.

## [0.5.0] - 2023-02-19

### Changed

- Switched to TypeScript instead of JavaScript.

## [0.4.0] - 2023-02-17

### Changed

- Unified all parsers into one tool.

## [0.3.1] - 2023-02-16

### Changed

- Refactoring parsers and create a library of common functions.

## [0.3.0] - 2023-02-15

### Added

- Added [tool](lib/parser/alfa.ts) to parse [Alfa-Bank](https://alfabank.ru/) statements.

## [0.2.0] - 2023-02-14

### Added

- Added [tool](lib/parser/tbc.ts) to parse [TBC Bank](https://www.tbcbank.ge/) `XML` statements.

## [0.1.0] - 2023-02-13

### Added

- Added [tool](bin/merge-tsv.ts) to merge multiple [TSV](https://en.wikipedia.org/wiki/Tab-separated_values) files into one.

## [0.0.2] - 2023-02-12

### Fixed

- Fixed parsing timestamps in Tinkoff Bank statements.

## [0.0.1] - 2023-02-11

### Added

- Added [tool](lib/parser/tinkoff.ts) to parse [Tinkoff Bank](https://www.tinkoff.ru/) statements.
