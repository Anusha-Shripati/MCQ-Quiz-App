import { Input } from "@/components/ui/form/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/form/select";
import { forwardRef } from "react";

interface FormFieldProps {
  label: string;
  id: string;
  type?: 'text' | 'email' | 'tel' | 'select';
  options?: Array<{ value: string; label: string }>;
  value?: string;
  error?: string | undefined; 
  onChange: (value: any) => void; 
  name?:string
}

export const FormField = forwardRef<HTMLInputElement, FormFieldProps>((props: FormFieldProps,ref) => (
  <div>
    <label className="block text-sm font-medium mb-1">{props.label}</label>
    {props.type === 'select' ? (
      <Select value={props.value} onValueChange={props.onChange} name={props.name}>
        <SelectTrigger>
          <SelectValue placeholder={`Select ${props.label}`} />
        </SelectTrigger>
        <SelectContent>
          {props.options?.map(option => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    ) : (
      <Input
        {...props}
        placeholder={`Enter ${props.label}`}
        ref={ref }
      />
    )}
    {props.error && <p className="text-red-500 text-sm mt-1">{props.error}</p>}
  </div>
)); 