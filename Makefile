SHELL := /bin/bash
.PHONY: test build clean lint example release

test:
	go test -v ./...

build:
	go build -v ./...

clean:
	rm -rf dist

lint:
	go vet ./...
	if command -v golangci-lint &> /dev/null; then golangci-lint run; fi

example:
	go run cmd/examples/main.go

release:
	@if [ -z "$(VERSION)" ]; then echo "VERSION is not set"; exit 1; fi
	@echo "Creating release v$(VERSION)"
	@git tag -a v$(VERSION) -m "Release v$(VERSION)"
	@git push origin v$(VERSION)
	@echo "Release v$(VERSION) created"
