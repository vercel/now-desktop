![](http://i.imgur.com/l2ClYVD.png)

[![Build Status](https://travis-ci.org/zeit/now-app.svg?branch=master)](https://travis-ci.org/zeit/now-app)
[![Slack Channel](https://zeit-slackin.now.sh/badge.svg)](https://zeit.chat/)
[![XO code style](https://img.shields.io/badge/code_style-XO-5ed9c7.svg)](https://github.com/sindresorhus/xo)

For more details, head to: https://zeit.co/now

## Usage

You can download the latest release from [here](https://now-auto-updates.now.sh/download/osx) (macOS - more platforms soon).

## Caught a bug?

1. [Fork](https://help.github.com/articles/fork-a-repo/) this repository to your own GitHub account and then [clone](https://help.github.com/articles/cloning-a-repository/) it to your local device
2. Install the dependencies: `npm install`
3. Bundle the source code and watch for changes: `npm run dev`
4. Start the app in a new terminal tab: `npm start`

To make sure that your code works in the bundled application, you can generate the binaries like this:

```bash
$ npm run pack
```

After that, you'll find them in the `./dist` folder!
