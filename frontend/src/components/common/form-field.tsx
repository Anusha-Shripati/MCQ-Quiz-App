import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

interface FormFieldProps {
  label: string;
  id: string;
  type?: 'text' | 'email' | 'tel' | 'select';
  options?: Array<{ value: string; label: string }>;
  value: string;
  error?: string;
  onChange: (value: string) => void;
}

export const FormField = ({
  label,
  id,
  type = 'text',
  options,
  value,
  error,
  onChange
}: FormFieldProps) => (
  <div>
    <label className="block text-sm font-medium mb-1">{label}</label>
    {type === 'select' ? (
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue placeholder={`Select ${label}`} />
        </SelectTrigger>
        <SelectContent>
          {options?.map(option => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    ) : (
      <Input
        id={id}
        type={type}
        placeholder={`Enter ${label}`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    )}
    {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
  </div>
); 