import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/form/select";
import { Input } from "@/components/ui/form/input";
import { FormField } from "./form-field";
import { useMemo } from "react";

interface DurationInputProps {
  label: string;
  timeUnit: 'days' | 'hours';
  timeValue: number | '';
  setTimeUnit: (unit: 'days' | 'hours') => void;
  setTimeValue: (value: number | '') => void;
  error?: string | undefined;
}

export const DurationInput = ({
  label,
  timeUnit,
  timeValue,
  setTimeUnit,
  setTimeValue,
  error
}: DurationInputProps) => {
  const durationOptions = useMemo(() => [
    { value: "days", label: "Days" }
  ], [])
    return (
      <div>
        <label className="block text-sm font-medium mb-1">{label}</label>
        <div className="flex items-center gap-4">
          <FormField
            type="number"
            value={timeValue}
            onChange={(e) => setTimeValue(e.target.valueAsNumber || '')}
            placeholder={`Enter ${timeUnit}`}
          />
          <FormField
            id="technology"
            type="select"
            options={durationOptions}
            value={timeUnit}
            onChange={(value) => setTimeUnit(value as 'days' | 'hours')}
          />
        </div>
        {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
      </div>
    )
}; 