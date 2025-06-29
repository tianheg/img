#!/usr/bin/env bash

main() {

  HUGO_VERSION=0.147.8

  export TZ=Asia/Hong_Kong

  # Install Hugo
  echo "Installing Hugo v${HUGO_VERSION}..."
  curl -LJO https://github.com/gohugoio/hugo/releases/download/v${HUGO_VERSION}/hugo_extended_${HUGO_VERSION}_linux-amd64.tar.gz
  tar -xf "hugo_extended_${HUGO_VERSION}_linux-amd64.tar.gz"
  cp hugo /opt/buildhome
  rm LICENSE README.md hugo_extended_${HUGO_VERSION}_linux-amd64.tar.gz

  # Set PATH
  echo "Setting the PATH environment variable..."
  export PATH=/opt/buildhome:$PATH

  # Verify installed versions
  echo "Verifying installations..."
  echo Go: "$(go version)"
  echo Hugo: "$(hugo version)"
  echo Node.js: "$(node --version)"

  # https://github.com/gohugoio/hugo/issues/9810
  git config core.quotepath false

  # Build the site.
  bun run build

}

set -euo pipefail
main "$@"
