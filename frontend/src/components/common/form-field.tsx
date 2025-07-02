import { Input } from '@/components/ui/form/input';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/form/select';
import { forwardRef, useMemo } from 'react';

interface FormFieldProps {
  label?: string;
  id?: string;
  type?: 'text' | 'email' | 'tel' | 'select' | 'number' | 'password' | 'search';
  options?: SelectOption[] | (string | number)[];
  value?: string | number;
  error?: string | undefined;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onChange: (value: any) => void;
  name?: string;
  className?: string | undefined;
  placeholder?: string;
  disabled?: boolean;
  min?: string | number | undefined;
  max?: string | number | undefined;
  parentClassName?: string;
  inputMode?: 'none' | 'text' | 'tel' | 'url' | 'email' | 'numeric' | 'decimal' | 'search';
  pattern?: string;
  maxLength?: number;
  onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void;
}

interface SelectOption {
  value: string | number;
  label: string | number;
}

export const FormField = forwardRef<HTMLInputElement, FormFieldProps>(
  ({ parentClassName, ...props }: FormFieldProps, ref) => {
    const normalizedOptions: SelectOption[] = useMemo(
      () =>
        Array.isArray(props.options)
          ? props.options.map((opt) => (typeof opt === 'object' ? opt : { value: opt, label: opt }))
          : [],
      [props.options]
    );
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (props.type === 'tel' || props.inputMode === 'numeric') {
        if (
          ['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', '.', ','].includes(e.key) ||
          ((e.key === 'a' || e.key === 'c' || e.key === 'v' || e.key === 'x') && e.ctrlKey) ||
          ['Home', 'End', 'ArrowLeft', 'ArrowRight'].includes(e.key) ||
          (!isNaN(Number(e.key)) && e.key.length === 1)
        ) {
          return;
        }
        e.preventDefault();
      }
    };

    return (
      <div className={parentClassName || ''}>
        {props.label && <label className="block text-sm font-medium mb-1">{props.label}</label>}
        {props.type === 'select' ? (
          <Select value={String(props.value)} onValueChange={props.onChange} name={props.name}>
            <SelectTrigger className={`${props.className} border-gray-200 hover:border-gray-200 dark:hover:border-gray-600 dark:border-gray-600  placeholder-gray-500 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent`}>
              <SelectValue placeholder={`Select ${props.placeholder || props.label || ''}`} />
            </SelectTrigger>
            <SelectContent>
              {normalizedOptions?.length > 0 ? (
                normalizedOptions.map((option: SelectOption) => (
                  <SelectItem key={option.value} value={String(option.value)}>
                    {option.label}
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="no-options" disabled>
                  No options available
                </SelectItem>
              )}
            </SelectContent>
          </Select>
        ) : (
          <Input
            {...props}
            placeholder={`${props.placeholder || 'Enter ' + (props.label || '')} `}
            ref={ref}
            onKeyDown={handleKeyDown}
          />
        )}
        {props.error && <p className="text-red-500 text-sm mt-1">{props.error}</p>}
      </div>
    );
  }
);
FormField.displayName = 'FormField';
