import React from 'react';
import Select from "react-select";
import { AssessmentOption } from "@/types/candidate.types";
import { cn } from "@/lib/utils";

interface AssessmentFilterProps {
  value: AssessmentOption[];
  onChange: (value: AssessmentOption[]) => void;
  options: AssessmentOption[];
  className?: string;
}

export function AssessmentFilter({ value, onChange, options, className }: AssessmentFilterProps) {
  return (
    <div className={cn("w-full md:w-72 lg:w-80 shrink-0", className)}>
      <Select
        isMulti
        value={value}
        onChange={(newValue) => onChange(newValue as AssessmentOption[])}
        options={options}
        placeholder="Select assessments"
        className="react-select-container"
        classNamePrefix="react-select"
        tabIndex={-1}
        blurInputOnSelect={true}
        unstyled
        styles={{
          container: (base) => ({
            ...base,
            width: '100%',
          }),
          control: (base, state) => ({
            ...base,
            minHeight: '2.75rem',
            padding: '2px',
            background: 'hsl(var(--background))',
            border: '1px ridge',
            borderColor: state.isFocused ? 'hsl(var(--ring))' : 'hsl(var(--input))',
            borderRadius: 'calc(var(--radius) - 2px)',
            boxShadow: state.isFocused ? '0 0 0 1px hsl(var(--ring))' : '0 0 0 0 transparent',
            '&:hover': {
              borderColor: 'hsl(var(--ring))',
            },
          }),
          valueContainer: (base) => ({
            ...base,
            padding: '0 8px',
            gap: '4px',
          }),
          menu: (base) => ({
            ...base,
            background: 'hsl(var(--background))',
            border: '1px solid hsl(var(--border))',
            borderRadius: 'var(--radius)',
            boxShadow: '0px 10px 38px -10px rgba(22, 23, 24, 0.35), 0px 10px 20px -15px rgba(22, 23, 24, 0.2)',
            zIndex: 50,
            overflow: 'hidden',
            marginTop: '8px',
          }),
          menuList: (base) => ({
            ...base,
            padding: '4px',
          }),
          option: (base, state) => ({
            ...base,
            position: 'relative',
            padding: '8px 8px',
            borderRadius: 'calc(var(--radius) - 4px)',
            cursor: 'pointer',
            fontSize: '14px',
            background: state.isFocused 
              ? 'hsl(var(--accent))' 
              : state.isSelected
                ? 'hsl(var(--accent))'
                : 'transparent',
            color: state.isFocused || state.isSelected
              ? 'hsl(var(--accent-foreground))'
              : 'hsl(var(--foreground))',
            '&:hover': {
              background: 'hsl(var(--accent))',
              color: 'hsl(var(--accent-foreground))',
            },
          }),
          multiValue: (base) => ({
            ...base,
            background: 'hsl(var(--accent))',
            borderRadius: 'calc(var(--radius) - 4px)',
            padding: '0 1px',
          }),
          multiValueLabel: (base) => ({
            ...base,
            fontSize: '14px',
            color: 'hsl(var(--accent-foreground))',
            padding: '2px 6px',
          }),
          multiValueRemove: (base) => ({
            ...base,
            borderRadius: 'calc(var(--radius) - 4px)',
            color: 'hsl(var(--accent-foreground))',
            ':hover': {
              background: 'hsl(var(--destructive))',
              color: 'hsl(var(--destructive-foreground))',
            },
          }),
          input: (base) => ({
            ...base,
            color: 'hsl(var(--foreground))',
            margin: '0',
            padding: '0',
          }),
          placeholder: (base) => ({
            ...base,
            color: 'hsl(var(--muted-foreground))',
          }),
          indicatorSeparator: () => ({
            display: 'none',
          }),
          dropdownIndicator: (base) => ({
            ...base,
            color: 'hsl(var(--foreground))',
            opacity: '0.6',
            '&:hover': {
              opacity: '1',
            },
          }),
          clearIndicator: (base) => ({
            ...base,
            color: 'hsl(var(--foreground))',
            opacity: '0.6',
            padding: '4px',
            ':hover': {
              opacity: '1',
            },
          }),
        }}
      />
    </div>
  );
}