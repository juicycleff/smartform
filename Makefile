SHELL := /bin/bash
.PHONY: test build clean lint example release

test:
	go test -v ./...

build:
	go build -v ./...

clean:
	rm -rf dist

#lint:
#	go vet ./...
#	if command -v golangci-lint &> /dev/null; then golangci-lint run; fi

# Basic linting with go vet
lint-basic:
	go vet ./...

# Advanced linting with golangci-lint
lint:
	go vet ./...
	@echo "Running golangci-lint..."
	@if command -v golangci-lint &> /dev/null; then \
		golangci-lint run; \
	else \
		echo "golangci-lint not found. Install with:"; \
		echo "  go install github.com/golangci/golangci-lint/cmd/golangci-lint@latest"; \
		exit 1; \
	fi

# Fix issues that can be automatically fixed with golangci-lint
lint-fix:
	@echo "Running golangci-lint with auto-fix..."
	@if command -v golangci-lint &> /dev/null; then \
		golangci-lint run --fix; \
	else \
		echo "golangci-lint not found. Install with:"; \
		echo "  go install github.com/golangci/golangci-lint/cmd/golangci-lint@latest"; \
		exit 1; \
	fi

# Format code with gofmt
format:
	@echo "Formatting Go code with gofmt..."
	@find . -type f -name "*.go" -not -path "./vendor/*" -not -path "./.git/*" | xargs gofmt -w -s

# Check if code is properly formatted
format-check:
	@echo "Checking if code is properly formatted..."
	@if [ -n "$$(find . -type f -name "*.go" -not -path "./vendor/*" -not -path "./.git/*" | xargs gofmt -l -s)" ]; then \
		echo "The following files are not correctly formatted:"; \
		find . -type f -name "*.go" -not -path "./vendor/*" -not -path "./.git/*" | xargs gofmt -l -s; \
		exit 1; \
	else \
		echo "All files are properly formatted."; \
	fi

# Combined format and lint fix
fix: format lint-fix
	@echo "Format and lint-fix completed."

example:
	go run cmd/examples/main.go

release:
	@if [ -z "$(VERSION)" ]; then echo "VERSION is not set"; exit 1; fi
	@echo "Creating release v$(VERSION)"
	@git tag -a v$(VERSION) -m "Release v$(VERSION)"
	@git push origin v$(VERSION)
	@echo "Release v$(VERSION) created"
