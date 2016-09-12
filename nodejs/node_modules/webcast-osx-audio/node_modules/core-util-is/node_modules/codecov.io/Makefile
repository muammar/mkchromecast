REPORTER = spec
test:
	@$(MAKE) lint
	@NODE_ENV=test ./node_modules/.bin/mocha -b --reporter $(REPORTER) --recursive

lint:
	./node_modules/.bin/jshint ./lib ./test ./index.js

test-cov:
	$(MAKE) lint
	@NODE_ENV=test ./node_modules/.bin/istanbul cover \
	./node_modules/mocha/bin/_mocha -- -R spec

test-codecov.io:
	@NODE_ENV=test ./node_modules/.bin/istanbul cover \
	./node_modules/mocha/bin/_mocha -- -R spec && \
		cat ./coverage/coverage.json | ./bin/codecov.io.js --verbose

deploy:
	$(eval VERSION := $(shell cat package.json | grep '"version"' | cut -d\" -f4))
	git tag v$(VERSION) -m ""
	git push origin v$(VERSION)
	npm publish

.PHONY: test
