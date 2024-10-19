import { Button } from '~/components/Button'
import { Input } from '~/components/Input'
import { Loading } from '~/components/Loading'

// remove `undefined` from setter argument union type
type UpdatePair<T> = [
  updated: () => T | undefined,
  setter: (updated: Exclude<T, undefined>) => void
]
type TextUpdate = string | undefined
type TextUpdatePair = UpdatePair<TextUpdate>

export default function Home() {
  const [updatedURL, setURL] = createSignal<TextUpdate>(
    undefined
  ) as TextUpdatePair
  const [downloadStatus, setDownloadStatus] = createSignal<string>('')
  const [isLoading, setIsLoading] = createSignal<boolean>(false)

  const urlListener = (
    element: InputEvent & {
      currentTarget: HTMLInputElement
      target: HTMLInputElement
    }
  ) => {
    element.stopPropagation()
    setURL(element.currentTarget.value)
  }

  const title = () => updatedURL() ?? ''

  const handleDownload = async () => {
    if (!updatedURL()) {
      setDownloadStatus('Please enter a valid URL')
      return
    }

    setIsLoading(true)
    setDownloadStatus('Downloading...')

    try {
      const response = await fetch('/api/download', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ url: updatedURL() })
      })

      const data = await response.json()

      if (response.ok) {
        setDownloadStatus(`Success: ${data.result}`)
      } else {
        setDownloadStatus(`Error: ${data.error || 'Unknown error occurred'}`)
      }
    } catch (error) {
      setDownloadStatus(`Error: ${error.message || 'Unknown error occurred'}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main>
      <h1>Hacienda</h1>
      <p>
        Hacienda allows you to download music from your favorite music streaming
        services for free. No fuss, nothing.
      </p>

      <p>Enter a URL below to proceed.</p>

      <div class="space-y-2">
        <Input
          role="link"
          required={true}
          placeholder="URL to your favorite music... 💕 🎵"
          onInput={urlListener}
          value={title()}
          disabled={isLoading()}
        />

        <Button
          size="icon"
          id="download-button"
          aria="Download"
          onClick={handleDownload}
          disabled={isLoading()}
        >
          {isLoading() ? <Loading /> : <IconLucideDownload />}
        </Button>

        {downloadStatus() && (
          <p
            class={`mt-2 ${downloadStatus().startsWith('Error') ? 'text-red-500' : 'text-green-500'}`}
          >
            {downloadStatus()}
          </p>
        )}
      </div>
    </main>
  )
}
