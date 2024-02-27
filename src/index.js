// console.log('Coming soon...')

// incase someone trys to import it
// module.exports = {}
module.exports = {
  version: require('../package.json').version,
  Server: require('./Main')
}
