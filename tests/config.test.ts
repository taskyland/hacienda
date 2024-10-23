import { loadConfig } from '../src/core/config'

describe('Config', () => {
  it('should be able to load the config', async () => {
    const config = await loadConfig()
    expect(config).toBeTypeOf('object')
  })
})
