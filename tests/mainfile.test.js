describe('version', () => {
    it('not be undefined', () => {
        const { version } = require('../src')
        expect(version).not.toBeUndefined()
      })
      it('Should be equal to the pkg.json version', () => { 
          const { version } = require('../src')
          const pkg = require('../package.json')
          expect(version).toBe(pkg.version)
      })
})