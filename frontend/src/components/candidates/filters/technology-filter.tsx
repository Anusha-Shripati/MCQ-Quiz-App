import Select from "react-select";
import { TechnologyOption } from "@/types/candidate.types";

interface TechnologyFilterProps {
  value: TechnologyOption[];
  onChange: (value: TechnologyOption[]) => void;
  options: TechnologyOption[];
}

export function TechnologyFilter({ value, onChange, options }: TechnologyFilterProps) {
  return (
    <div className="w-full md:w-72 lg:w-80 shrink-0 z-[100]">
      <Select
        isMulti
        value={value}
        onChange={(newValue) => onChange(newValue as TechnologyOption[])}
        options={options}
        placeholder="Select technologies"
        className="react-select-container z-[100]"
        classNamePrefix="react-select"
        theme={(theme) => ({
          ...theme,
          colors: {
            ...theme.colors,
            primary: '#3b82f6',
            primary75: '#60a5fa',
            primary50: '#93c5fd',
            primary25: '#dbeafe',
          },
        })}
        styles={{
          control: (base, state) => ({
            ...base,
            minHeight: '2.75rem',
            backgroundColor: 'white',
            borderColor: state.isFocused ? '#3b82f6' : '#e5e7eb',
            boxShadow: state.isFocused ? '0 0 0 2px rgba(59, 130, 246, 0.5)' : 'none',
            '&:hover': {
              borderColor: '#3b82f6',
            },
          }),
          // ... rest of the styles remain the same
        }}
      />
    </div>
  );
} 