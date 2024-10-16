import { Button } from '~/components/Button'
import { Input } from '~/components/Input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '~/components/Select'

const services = ['Tidal', 'Qobuz', 'Deezer']

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
        />

        <Select
          options={services}
          placeholder="Select a service…"
          itemComponent={(props) => (
            <SelectItem item={props.item}>{props.item.rawValue}</SelectItem>
          )}
        >
          <SelectTrigger>
            <SelectValue<string>>
              {(state) => state.selectedOption()}
            </SelectValue>
          </SelectTrigger>
          <SelectContent />
        </Select>

        <Button id="download-button" aria="Download">
          Download
        </Button>
      </div>
    </main>
  )
}
