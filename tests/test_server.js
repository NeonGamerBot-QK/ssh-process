const { Server } = require('../src/index')

const s = new Server({
  ssh: {
    allowedUser: Buffer.from('root'),
    allowedPassword: Buffer.from('test'),
    server: {
      hostKeys: [require('fs').readFileSync('host.key')]
    }
  }
})
s.listen(38049)
