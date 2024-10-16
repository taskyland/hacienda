import fsp from 'node:fs/promises'
import Deezer from 'lucida/streamers/deezer'
import Qobuz from 'lucida/streamers/qobuz'
import Tidal from 'lucida/streamers/tidal'
import { resolve } from 'pathe'
import { parse } from 'smol-toml'

export interface Config {
  /** Some modules require a login */
  login?: boolean
  /** Directory to download to */
  directory: string
  /** Concurrency limit */
  concurrency?: number
  /** Modules to use */
  modules: Partial<{
    deezer: Deezer
    tidal: Tidal
    qobuz: Qobuz
    // spotify: Spotify --- Unsupported
  }>
  /** Login credentials */
  logins?: {
    [key: string]: {
      username: string
      password: string
    }
  }
}

export async function loadConfig() {
  const configPath = resolve('config.toml')
  // Check if config.toml exists, if not, create it
  try {
    await fsp.access(configPath)
  } catch (_) {
    await fsp.writeFile(
      resolve('config.toml'),
      await fsp.readFile(resolve('config.example.toml'), { encoding: 'utf-8' })
    )
  }
  const configFile = await fsp.readFile(configPath, {
    encoding: 'utf-8'
  })

  const config = parse(configFile) as unknown as Config

  // Resolve paths
  const _downloadDir = resolve(config.directory)
  try {
    await fsp.access(_downloadDir)
  } catch (_) {
    await fsp.mkdir(_downloadDir)
  }
  config.directory = _downloadDir

  // Resolve loaded modules
  if (config.modules.qobuz) {
    config.modules.qobuz = new Qobuz({
      appId: config.modules.qobuz.appId,
      token: config.modules.qobuz.token,
      appSecret: config.modules.qobuz.appSecret
    })
  }
  if (config.modules.tidal) {
    config.modules.tidal = new Tidal({
      expires: config.modules.tidal.expires,
      tvToken: config.modules.tidal.tvToken,
      tvSecret: config.modules.tidal.tvSecret,
      accessToken: config.modules.tidal.accessToken,
      countryCode: config.modules.tidal.countryCode,
      refreshToken: config.modules.tidal.refreshToken
    })
  }
  if (config.modules.deezer) {
    config.modules.deezer = new Deezer({
      arl: config.modules.deezer.arl
    })
  }

  if (config.logins) {
    for (const [key, value] of Object.entries(config.logins)) {
      config.logins[key] = {
        username: value.username,
        password: value.password
      }
    }
  }

  return config
}
