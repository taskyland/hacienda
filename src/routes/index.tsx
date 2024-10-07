import { Button } from '~/components/Button';
import { Input } from '~/components/Input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '~/components/Select';

const services = ['Tidal', 'Qobuz', 'Deezer'];

export default function Home() {
  const [_input, setInput] = createSignal('');

  return (
    <main>
      <h1>Hacienda</h1>
      <p>
        This project allows you to download music from your favorite music
        streaming services for free. No fuss, nothing.
      </p>

      <p>Enter a URL below to proceed.</p>

      <div class="space-y-2">
        <Input
          id="input"
          placeholder="URL to your favorite music... 💕 🎵"
          onInput={(a) => {
            setInput(a.currentTarget.value);
          }}
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
  );
}
