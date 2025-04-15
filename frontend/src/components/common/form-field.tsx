import { Input } from "@/components/ui/form/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/form/select";
import { forwardRef, useMemo } from "react";

interface FormFieldProps {
  label?: string;
  id?: string;
  type?: "text" | "email" | "tel" | "select" | "number" | "password";
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
  inputMode?:
    | "none"
    | "text"
    | "tel"
    | "url"
    | "email"
    | "numeric"
    | "decimal"
    | "search";
  pattern?: string;
  maxLength?: number;
}

interface SelectOption {
  value: string | number;
  label: string | number;
}

export const FormField = forwardRef<HTMLInputElement, FormFieldProps>(({ parentClassName, ...props }: FormFieldProps, ref) => {
  
  const normalizedOptions: SelectOption[] = useMemo(()=> Array.isArray(props.options)
    ? props.options.map(opt =>
      typeof opt === "object" ? opt : { value: opt, label: opt }
    )
    : [],[props.options]);

    // const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    //   if (props.type === "tel" || props.inputMode === "numeric") {
    //     // Allow: backspace, delete, tab, escape, enter, decimal point, numbers
    //     if (
    //       [46, 8, 9, 27, 13, 110, 190].indexOf(e.keyCode) !== -1 ||
    //       // Allow: Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
    //       (e.keyCode === 65 && e.ctrlKey === true) ||
    //       (e.keyCode === 67 && e.ctrlKey === true) ||
    //       (e.keyCode === 86 && e.ctrlKey === true) ||
    //       (e.keyCode === 88 && e.ctrlKey === true) ||
    //       // Allow: home, end, left, right
    //       (e.keyCode >= 35 && e.keyCode <= 39) ||
    //       // Allow numbers
    //       (e.keyCode >= 48 && e.keyCode <= 57) ||
    //       (e.keyCode >= 96 && e.keyCode <= 105)
    //     ) {
    //       return;
    //     }
    //     e.preventDefault();
    //   }
    // };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (props.type === "tel" || props.inputMode === "numeric") {
        // Allow: backspace, delete, tab, escape, enter, decimal point, numbers
        if (
          ["Backspace", "Delete", "Tab", "Escape", "Enter", ".", ","].includes(
            e.key
          ) ||
          // Allow: Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
          ((e.key === "a" || e.key === "c" || e.key === "v" || e.key === "x") &&
            e.ctrlKey) ||
          // Allow: home, end, left, right
          ["Home", "End", "ArrowLeft", "ArrowRight"].includes(e.key) ||
          // Allow numbers
          (!isNaN(Number(e.key)) && e.key.length === 1)
        ) {
          return;
        }
        e.preventDefault();
      }
    };

    return (
      <div className={parentClassName || ""}>
        {props.label && (
          <label className="block text-sm font-medium mb-1">
            {props.label}
          </label>
        )}
        {props.type === "select" ? (
          <Select
            value={String(props.value)}
            onValueChange={props.onChange}
            name={props.name}
          >
            <SelectTrigger className={props.className}>
              <SelectValue
                placeholder={`Select ${props.placeholder || props.label || ""}`}
              />
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
            placeholder={`${props.placeholder || "Enter " + (props.label || "")} `}
            ref={ref}
            onKeyDown={handleKeyDown}
          />
        )}
        {props.error && (
          <p className="text-red-500 text-sm mt-1">{props.error}</p>
        )}
      </div>
    );
  }
);
FormField.displayName = "FormField";
