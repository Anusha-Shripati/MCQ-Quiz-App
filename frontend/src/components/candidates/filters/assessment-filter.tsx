// Updated AssessmentFilter component
import Select from "react-select";
import { AssessmentOption } from "@/types/candidate.types";

interface AssessmentFilterProps {
  value: AssessmentOption[];
  onChange: (value: AssessmentOption[]) => void;
  options: AssessmentOption[];
}

export function AssessmentFilter({ value, onChange, options }: AssessmentFilterProps) {
  return (
    <div className="w-full md:w-72 lg:w-80 shrink-0">
      <Select
        isMulti
        value={value}
        onChange={(newValue) => onChange(newValue as AssessmentOption[])}
        options={options}
        placeholder="Select assessments"
        className="react-select-container"
        classNamePrefix="react-select"
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
          menu: base => ({
            ...base,
            borderRadius: '0.5rem',
            marginTop: '0.25rem',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }),
          menuList: base => ({
            ...base,
            padding: '0.5rem'
          }),
          option: (base, state) => ({
            ...base,
            borderRadius: '0.375rem',
            backgroundColor: state.isSelected ? '#3b82f6' : state.isFocused ? '#eff6ff' : 'white',
            color: state.isSelected ? 'white' : '#1f2937',
            ':active': {
              backgroundColor: state.isSelected ? '#2563eb' : '#dbeafe'
            }
          }),
          multiValue: base => ({
            ...base,
            backgroundColor: '#eff6ff',
            borderRadius: '0.375rem'
          }),
          multiValueLabel: base => ({
            ...base,
            color: '#1d4ed8',
            fontWeight: '500'
          }),
          multiValueRemove: base => ({
            ...base,
            ':hover': {
              backgroundColor: '#bfdbfe',
              color: '#1e3a8a'
            }
          })
        }}
      />
    </div>
  );
}