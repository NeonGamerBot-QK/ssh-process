const os = require('os')
const shell = os.platform() === 'win32' ? 'powershell.exe' : 'bash'
const pty = require('node-pty')

module.exports.createShellInstance = (ops = {
  name: 'xterm-color',
  cols: 80,
  rows: 30,
  cwd: process.env.HOME,
  env: process.env
}) => {
  const shellInstance = pty.spawn(shell, [], ops)
  return shellInstance
}
