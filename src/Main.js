/* eslint-disable no-unused-vars */
const { Server } = require('ssh2')
const { inspect } = require('util')
const { timingSafeEqual } = require('crypto')
const Client = require('ssh2/lib/client')
const { Channel } = require('ssh2/lib/Channel')
module.exports = class SSHServer {
  constructor (ops = {
    termOps: null,
    sshOps: { ssh: { hostKeys: [] } }
  }) {
    this.ops = ops
    this.termOps = ops.term || {}
    this.sshOps = ops.ssh || {}
    this.init()
  }

  checkValue (input, allowed) {
    const autoReject = (input.length !== allowed.length)
    if (autoReject) {
      // Prevent leaking length information by always making a comparison with the
      // same input when lengths don't match what we expect ...
      allowed = input
    }
    const isMatch = timingSafeEqual(input, allowed)
    return (!autoReject && isMatch)
  }

  onServerSetup (client) {
    const checkValue = this.checkValue
    this.sshClient = client
    client.on('authentication', (ctx) => {
      let allowed = true
      if (!checkValue(Buffer.from(ctx.username), this.sshOps.allowedUser)) { allowed = false }

      switch (ctx.method) {
        case 'password':
          if (!checkValue(Buffer.from(ctx.password), this.sshOps.allowedPassword)) { return ctx.reject() }
          break
          // public key not supported yet, v3?
        // case 'publickey':
        //   if (ctx.key.algo !== allowedPubKey.type ||
        //     !checkValue(ctx.key.data, allowedPubKey.getPublicSSH()) ||
        //     (ctx.signature && allowedPubKey.verify(ctx.blob, ctx.signature, ctx.hashAlgo) !== true)) {
        //     return ctx.reject()
        //   }
        //   break
        default:
          return ctx.reject()
      }

      if (allowed) { ctx.accept() } else { ctx.reject() }
    })
    client.on('ready', () => {
      this.onConnection(client)
    })
  }

  /**
 *
 * @param {Client} client
 */
  onConnection (client) {
    //   client.on('session')
    // client.on('')
    // client.
    let rows
    let cols
    let term
    client.on('session', (accept, reject) => {
      // accept

      const session = accept()
      session.once('pty', (accept, reject, info) => {
        rows = info.rows
        cols = info.cols
        term = info.term
        accept && accept()
      }).once('shell', (accept, reject) => {
        /**
               * @type {Channel}
               */
        const stream = accept()
        const terminal = require('./TerminalInstance').createShellInstance({
          name: this.termOps.name || 'xterm-color',
          cols,
          rows,
          cwd: this.termOps.cwd || process.env.HOME,
          env: this.termOps.env || process.env
        })
        stream.isTTY = true
        // stream.isTTY =
        terminal.onData((e) => {
          stream.stdout.write(e)
        })
        terminal.onExit((c) => {
          stream.end(c.signal || 'Bye bye\n')
          client.end(c.exitCode)
        })
        stream.stdin.on('data', (dd) => {
          // console.log(dd, dd.toString('base64'))
        //   process.stdout.write(dd.toString())
          terminal.write(dd.toString())
        })
        // stream.stdout.write('Hello World!\n')
      })

      // session
    })
  }

  init () {
    this.sshServer = new Server(this.sshOps.server, this.onServerSetup.bind(this))
  }

  listen (port, cb) {
    this.sshServer.listen(port || this.sshOps.port || 0, cb || (() => {
      console.log(` On ::${this.sshServer.address().port}`)
    }))
  }
}
