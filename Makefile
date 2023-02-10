all: install test

install:
	@npm i

test:
	@npm run lint
	@npm test
