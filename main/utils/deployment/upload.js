// Native
const { basename } = require('path')
const { homedir } = require('os')
const qs = require('querystring')

// Packages
const { clipboard, shell } = require('electron')
const { EventEmitter } = require('events')
const { parse: parseUrl } = require('url')
const splitArray = require('split-array')
const resumer = require('resumer')
const retry = require('async-retry')
const { parse: parseIni } = require('ini')
const { readFile, stat, lstat } = require('fs-promise')
const bytes = require('bytes')

// Ours
const { error: showError } = require('../../dialogs')
const notify = require('../../notify')
const { get: getConfig } = require('../config')
const Agent = require('./agent')
const {
  staticFiles: getFiles,
  npm: getNpmFiles,
  docker: getDockerFiles
} = require('./get-files')
const hash = require('./hash')
const ua = require('./ua')
const readMetaData = require('./read-metadata')

// How many concurrent HTTP/2 stream uploads
const MAX_CONCURRENT = 4

const IS_WIN = process.platform.startsWith('win')
const SEP = IS_WIN ? '\\' : '/'

class Now extends EventEmitter {
  constructor({
    apiUrl = 'https://api.zeit.co',
    token,
    currentTeam,
    forceNew = false,
    debug = false
  }) {
    super()
    this._token = token
    this._debug = debug
    this._forceNew = forceNew
    this._agent = new Agent(apiUrl, { debug })
    this._onRetry = this._onRetry.bind(this)
    this.currentTeam = currentTeam
  }

  async create(
    path,
    {
      wantsPublic,
      quiet = false,
      env = {},
      followSymlinks = true,
      forceNew = false,
      forceSync = false,
      forwardNpm = false,

      // From readMetaData
      name,
      description,
      type = 'npm',
      pkg = {},
      nowConfig = {},
      hasNowJson = false
    }
  ) {
    this._path = path
    this._isFile = await isFile(path)

    let files
    let engines

    if (this._debug) {
      console.time('> [debug] Getting files')
    }

    const opts = { debug: this._debug, hasNowJson }
    if (type === 'npm') {
      files = await getNpmFiles(path, pkg, nowConfig, opts)

      // A `start` or `now-start` npm script, or a `server.js` file
      // in the root directory of the deployment are required
      if (!hasNpmStart(pkg) && !hasFile(path, files, 'server.js')) {
        const err = new Error(
          'Missing `start` (or `now-start`) script in `package.json`. ' +
            'See: https://docs.npmjs.com/cli/start.'
        )
        err.userError = true
        throw err
      }

      engines = nowConfig.engines || pkg.engines
      forwardNpm = forwardNpm || nowConfig.forwardNpm
    } else if (type === 'static') {
      files = await getFiles(path, nowConfig, opts)
    } else if (type === 'docker') {
      files = await getDockerFiles(path, nowConfig, opts)
    }

    if (this._debug) {
      console.timeEnd('> [debug] Getting files')
    }

    // Read `registry.npmjs.org` authToken from .npmrc
    let authToken
    if (type === 'npm' && forwardNpm) {
      authToken =
        (await readAuthToken(path)) || (await readAuthToken(homedir()))
    }

    if (this._debug) {
      console.time('> [debug] Computing hashes')
    }

    const pkgDetails = Object.assign({ name }, pkg)
    const hashes = await hash(files, pkgDetails)

    if (this._debug) {
      console.timeEnd('> [debug] Computing hashes')
    }

    this._files = hashes

    const deployment = await this.retry(async bail => {
      if (this._debug) {
        console.time('> [debug] /now/create')
      }

      // Flatten the array to contain files to sync where each nested input
      // array has a group of files with the same sha but different path
      const files = await Promise.all(
        Array.prototype.concat.apply(
          [],
          await Promise.all(
            Array.from(this._files).map(async ([sha, { data, names }]) => {
              const statFn = followSymlinks ? stat : lstat

              return names.map(async name => {
                const getMode = async () => {
                  const st = await statFn(name)
                  return st.mode
                }

                const mode = await getMode()

                return {
                  sha,
                  size: data.length,
                  file: this._isFile
                    ? basename(this._path)
                    : toRelative(name, this._path),
                  mode
                }
              })
            })
          )
        )
      )

      const res = await this._fetch('/now/create', {
        method: 'POST',
        body: {
          env,
          public: wantsPublic || nowConfig.public,
          forceNew,
          forceSync,
          name,
          description,
          deploymentType: type,
          registryAuthToken: authToken,
          files,
          engines
        }
      })

      if (this._debug) {
        console.timeEnd('> [debug] /now/create')
      }

      // No retry on 4xx
      let body
      try {
        body = await res.json()
      } catch (err) {
        throw new Error('Unexpected response')
      }

      if (res.status === 429) {
        const msg = 'You are being rate limited. Please try again later'
        const err = new Error(msg)
        err.status = res.status
        err.retryAfter = 'never'
        return bail(err)
      } else if (res.status >= 400 && res.status < 500) {
        const err = new Error(body.error.message)
        err.userError = true
        return bail(err)
      } else if (res.status !== 200) {
        throw new Error(body.error.message)
      }

      return body
    })

    // We report about files whose sizes are too big
    let missingVersion = false
    if (deployment.warnings) {
      let sizeExceeded = 0
      deployment.warnings.forEach(warning => {
        if (warning.reason === 'size_limit_exceeded') {
          const { sha, limit } = warning
          const n = hashes.get(sha).names.pop()
          showError(`Skipping file ${n} (size exceeded ${bytes(limit)})`)
          hashes.get(sha).names.unshift(n) // Move name (hack, if duplicate matches we report them in order)
          sizeExceeded++
        } else if (warning.reason === 'node_version_not_found') {
          const { wanted, used } = warning
          showError(
            `Requested node version ${wanted} is not available. Used ${used}`
          )
          missingVersion = true
        }
      })

      if (sizeExceeded) {
        showError(
          `${sizeExceeded} of the files exceeded the limit for your plan. Please upgrade`
        )
      }
    }

    if (!quiet && type === 'npm' && deployment.nodeVersion) {
      if (engines && engines.node) {
        if (missingVersion) {
          console.log(`> Using Node.js ${deployment.nodeVersion} (default)`)
        } else {
          console.log(
            `> Using Node.js ${deployment.nodeVersion} (requested: ${`\`${engines.node}\``})`
          )
        }
      } else {
        console.log(`> Using Node.js ${deployment.nodeVersion} (default)`)
      }
    }

    this._id = deployment.deploymentId
    this._name = pkgDetails.name || name
    this._host = deployment.url
    this._missing = deployment.missing || []

    return this._url
  }

  get id() {
    return this._id
  }

  get url() {
    return `https://${this._host}`
  }

  get host() {
    return this._host
  }

  get syncAmount() {
    if (!this._syncAmount) {
      this._syncAmount = this._missing
        .map(sha => this._files.get(sha).data.length)
        .reduce((a, b) => a + b, 0)
    }
    return this._syncAmount
  }

  _fetch(_url, opts = {}) {
    if (!opts.useCurrentTeam && this.currentTeam) {
      const parsedUrl = parseUrl(_url, true)
      const query = parsedUrl.query
      query.teamId = this.currentTeam.id
      _url = `${parsedUrl.pathname}?${qs.encode(query)}`
      delete opts.useCurrentTeam
    }

    opts.headers = opts.headers || {}
    opts.headers.authorization = `Bearer ${this._token}`
    opts.headers['user-agent'] = ua
    return this._agent.fetch(_url, opts)
  }

  upload() {
    const parts = splitArray(this._missing, MAX_CONCURRENT)

    if (this._debug) {
      console.log(
        '> [debug] Will upload ' +
          `${this._missing.length} files in ${parts.length} ` +
          `steps of ${MAX_CONCURRENT} uploads.`
      )
    }

    const uploadChunk = () => {
      Promise.all(
        parts.shift().map(sha =>
          retry(
            async (bail, attempt) => {
              const file = this._files.get(sha)
              const { data, names } = file

              if (this._debug) {
                console.time(`> [debug] /sync #${attempt} ${names.join(' ')}`)
              }

              const stream = resumer().queue(data).end()
              const res = await this._fetch('/now/sync', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/octet-stream',
                  'Content-Length': data.length,
                  'x-now-deployment-id': this._id,
                  'x-now-sha': sha,
                  'x-now-file': names
                    .map(name => {
                      return this._isFile
                        ? basename(this._path)
                        : toRelative(encodeURIComponent(name), this._path)
                    })
                    .join(','),
                  'x-now-size': data.length
                },
                body: stream
              })

              if (this._debug) {
                console.timeEnd(
                  `> [debug] /sync #${attempt} ${names.join(' ')}`
                )
              }

              // No retry on 4xx
              if (
                res.status !== 200 &&
                (res.status >= 400 || res.status < 500)
              ) {
                if (this._debug) {
                  console.log(
                    '> [debug] bailing on creating due to %s',
                    res.status
                  )
                }

                return bail(await responseError(res))
              }

              this.emit('upload', file)
            },
            { retries: 3, randomize: true, onRetry: this._onRetry }
          )
        )
      )
        .then(() => (parts.length ? uploadChunk() : this.emit('complete')))
        .catch(err => this.emit('error', err))
    }

    uploadChunk()
  }

  retry(fn, { retries = 3, maxTimeout = Infinity } = {}) {
    return retry(fn, {
      retries,
      maxTimeout,
      onRetry: this._onRetry
    })
  }

  _onRetry(err) {
    if (this._debug) {
      console.log(`> [debug] Retrying: ${err}\n${err.stack}`)
    }
  }

  close() {
    this._agent.close()
  }
}

module.exports = async (dir, deploymentType) => {
  process.env.BUSYNESS = 'deploying'

  let config
  try {
    config = await getConfig()
  } catch (err) {
    showError('Error reading configuration')
    return
  }

  const now = new Now({
    type: deploymentType,
    token: config.token,
    debug: true
  })

  now.on('error', err => {
    showError(err.message)
  })

  try {
    await now.create(dir, await readMetaData(dir, { deploymentType }))
  } catch (err) {
    showError(err.message)
    return
  }

  const { url } = now

  // Open the URL in the default browser
  shell.openExternal(url)

  // Copy deployment URL to clipboard
  clipboard.writeText(url)

  // Let the user now
  notify({
    title: 'Deploying...',
    body: 'Your clipboard contains the URL.',
    url
  })

  function ready() {
    now.close()
  }

  if (now.syncAmount) {
    now.upload()

    now.on('upload', ({ names, data }) => {
      console.log(
        `> [debug] Uploaded: ${names.join(' ')} (${bytes(data.length)})`
      )
    })

    now.on('complete', ready)
  } else {
    ready()
  }
}

function hasNpmStart(pkg) {
  return pkg.scripts && (pkg.scripts.start || pkg.scripts['now-start'])
}

function hasFile(base, files, name) {
  const relative = files.map(file => toRelative(file, base))
  return relative.indexOf(name) !== -1
}

function toRelative(path, base) {
  const fullBase = base.endsWith(SEP) ? base : base + SEP
  let relative = path.substr(fullBase.length)

  if (relative.startsWith(SEP)) {
    relative = relative.substr(1)
  }

  return relative.replace(/\\/g, '/')
}

async function responseError(res) {
  let message
  let userError

  if (res.status >= 400 && res.status < 500) {
    let body

    try {
      body = await res.json()
    } catch (err) {
      body = {}
    }

    // Some APIs wrongly return `err` instead of `error`
    message = (body.error || body.err || {}).message
    userError = true
  } else {
    userError = false
  }

  const err = new Error(message || 'Response error')
  err.status = res.status
  err.userError = userError

  if (res.status === 429) {
    const retryAfter = res.headers.get('Retry-After')

    if (retryAfter) {
      err.retryAfter = parseInt(retryAfter, 10)
    }
  }

  return err
}

async function readAuthToken(path, name = '.npmrc') {
  try {
    const contents = await readFile(path.resolve(path, name), 'utf8')
    const npmrc = parseIni(contents)
    return npmrc['//registry.npmjs.org/:_authToken']
  } catch (err) {
    // Do nothing
  }
}

async function isFile(file) {
  const s = await lstat(file)
  return s.isFile()
}
