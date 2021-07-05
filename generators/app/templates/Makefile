# <%= appname %> Makefile

.PHONY: build clean clean-coverage lint test dist

APPVERSION=$(shell cat VERSION)
OSES=linux
GO_LDFLAGS=-ldflags "-X '<%= repourl %>/cmd/<%= appname %>/cmd.AppVersion=$(APPVERSION)'"
BINPREFIX=<%= appname %>-$(APPVERSION)_

build:
	if [ ! -d dist ]; then mkdir dist; fi
	go build $(GO_LDFLAGS) -o dist/<%= appname %> ./cmd/<%= appname %>

clean-coverage:
	if [ -d coverage ]; then rm -Rf coverage; fi

clean: clean-coverage
	if [ -d dist ]; then rm -Rf dist; fi

lint:
	go vet ./...
	golangci-lint run

test: clean-coverage
	if [ ! -d coverage ]; then mkdir coverage; fi
	go test -covermode=count -coverprofile=coverage/cover.out ./...
	go tool cover -html=coverage/cover.out -o coverage/coverage.html

dist: lint
	@if [ ! -d dist ]; then mkdir dist; fi
	@for os in $(OSES); do \
		echo "Building for $$os" && \
  		GOARCH=amd64 GOOS=$$os go build $(GO_LDFLAGS) -o dist/$(BINPREFIX)$$os-amd64 ./cmd/<%= appname %> && \
  		cd dist && \
  		tar cfJ $(BINPREFIX)$$os-amd64.tar.xz $(BINPREFIX)$$os-amd64 && \
        sha512sum $(BINPREFIX)$$os-amd64.tar.xz > $(BINPREFIX)$$os-amd64.tar.xz.sha512 && \
        cd ..; \
    done
