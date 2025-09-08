import { FormField } from './form-field';
import { useMemo } from 'react';

interface DurationInputProps {
  label: string;
  timeUnit: 'days' | 'week' | 'hours';
  timeValue: number | '';
  setTimeUnit: (unit: 'days' | 'week' | 'hours') => void;
  setTimeValue: (value: number | '') => void;
  error?: string | undefined;
}

export const DurationInput = ({
  label,
  timeUnit,
  timeValue,
  setTimeUnit,
  setTimeValue,
  error,
}: DurationInputProps) => {
  const durationOptions = useMemo(
    () => [
      { value: 'days', label: 'Days' },
      { value: 'week', label: 'Weeks' },
      { value: 'hours', label: 'Hours' },
    ],
    []
  );
  return (
    <div>
      <label className="block text-sm font-medium mb-1">{label}</label>
      <div className="flex items-center gap-4">
        <FormField
          type="number"
          value={timeValue}
          onChange={(e) => setTimeValue(parseInt(e.target.value) || '')}
          placeholder={`Enter ${timeUnit}`}
        />
        <FormField
          id="duration-unit"
          type="select"
          options={durationOptions}
          value={timeUnit}
          onChange={(value) => setTimeUnit(value as 'days' | 'week' | 'hours')}
        />
      </div>
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
};
