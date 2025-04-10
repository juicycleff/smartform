.PHONY: build test lint clean release

build:
	go build -v ./...

test:
	go test -v ./...

lint:
	golangci-lint run

clean:
	rm -rf ./bin

release:
	@echo "Creating new release $(version)"
	@git tag -a v$(version) -m "Release v$(version)"
	@git push origin v$(version)
	@echo "Release v$(version) created and pushed to GitHub"
