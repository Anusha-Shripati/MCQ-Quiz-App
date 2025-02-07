import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

interface DurationInputProps {
  label: string;
  timeUnit: 'days' | 'hours';
  timeValue: number | '';
  setTimeUnit: (unit: 'days' | 'hours') => void;
  setTimeValue: (value: number | '') => void;
  error?: string;
}

export const DurationInput = ({
  label,
  timeUnit,
  timeValue,
  setTimeUnit,
  setTimeValue,
  error
}: DurationInputProps) => (
  <div>
    <label className="block text-sm font-medium mb-1">{label}</label>
    <div className="flex items-center gap-4">
      <Input
        type="number"
        placeholder={`Enter ${timeUnit}`}
        value={timeValue}
        onChange={(e) => setTimeValue(e.target.valueAsNumber || '')}
        min="1"
      />
      <Select value={timeUnit} onValueChange={(value) => setTimeUnit(value as 'days' | 'hours')}>
        <SelectTrigger>
          <SelectValue placeholder="Duration" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="days">Days</SelectItem>
        </SelectContent>
      </Select>
    </div>
    {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
  </div>
); 