import { Input } from "@/components/ui/form/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/form/select";
import { forwardRef, useMemo } from "react";

interface FormFieldProps {
  label?: string;
  id?: string;
  type?: 'text' | 'email' | 'tel' | 'select' | 'number' | 'password';
  options?: SelectOption[] | (string | number)[];
  value?: string | number;
  error?: string | undefined;
  onChange: (value: any) => void;
  name?: string;
  className?: string | undefined;
  placeholder?: string;
  disabled?:boolean;
  min?:string | number | undefined;
  max?:string | number | undefined;
  parentClassName?:string;

}

interface SelectOption {
  value: string | number;
  label: string | number;
}

export const FormField = forwardRef<HTMLInputElement, FormFieldProps>((props: FormFieldProps, ref) => {
  const normalizedOptions: SelectOption[] = useMemo(()=> Array.isArray(props.options)
    ? props.options.map(opt =>
      typeof opt === "object" ? opt : { value: opt, label: opt }
    )
    : [],[]);

  return (
    <div className={props.parentClassName || ''}>
      {props.label && <label className="block text-sm font-medium mb-1">{props.label}</label>}
      {props.type === 'select' ? (
        <Select value={String(props.value)} onValueChange={props.onChange} name={props.name}>
          <SelectTrigger className={props.className}>
            <SelectValue placeholder={`Select ${props.placeholder || props.label || ''}`} />
          </SelectTrigger>
          <SelectContent>
            {normalizedOptions?.map(option => (
              <SelectItem key={option.value} value={String(option.value)}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : (
        <Input
          {...props}
          placeholder={`${props.placeholder || 'Enter '+ (props.label || '')} `}
          ref={ref}
        />
      )}
      {props.error && <p className="text-red-500 text-sm mt-1">{props.error}</p>}
    </div>
  )
}); 