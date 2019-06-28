![](https://assets.zeit.co/image/upload/v1561730357/repositories/now-desktop/now-desktop-repo-banner.png)

[![macOS CI Status](https://circleci.com/gh/zeit/now-desktop.svg?style=shield)](https://circleci.com/gh/zeit/now-desktop)
[![Windows CI status](https://dev.azure.com/zeit-builds/Now%20Desktop/_apis/build/status/now-desktop)](https://dev.azure.com/zeit-builds/Now%20Desktop/_build/latest?definitionId=1)
[![Join the community on Spectrum](https://withspectrum.github.io/badge/badge.svg)](https://spectrum.chat/zeit)

For more details about Now and why you should use it, head to [this page](https://zeit.co/now).

## Usage

You can download the latest release [here](https://zeit.co/download).

If you're using [Homebrew Cask](https://caskroom.github.io), you can install it by running these commands:

```bash
brew update
brew cask install now
```

## Caught a bug?

1. [Fork](https://help.github.com/articles/fork-a-repo/) this repository to your own GitHub account and then [clone](https://help.github.com/articles/cloning-a-repository/) it to your local device
2. Install the dependencies: `yarn install`
3. Start the app: `yarn start`

To make sure that your code works in the bundled application, you can generate the binaries like this:

```bash
yarn run build
```

After that, you'll find them in the `./dist` folder!

## Authors

- Leo Lamprecht ([@notquiteleo](https://twitter.com/notquiteleo)) - code - [ZEIT](https://zeit.co)
- Evil Rabbit ([@evilrabbit_](https://twitter.com/evilrabbit_)) - design - [ZEIT](https://zeit.co)
- Guillermo Rauch ([@rauchg](https://twitter.com/rauchg)) - [ZEIT](https://zeit.co)
- Matheus Fernandes ([@matheusfrndes](https://twitter.com/matheusfrndes)) - code - [ZEIT](https://zeit.co)
