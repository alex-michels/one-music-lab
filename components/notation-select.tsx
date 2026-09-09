'use client';
import { useId } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';

/** The lab's labelled, keyboard-operable choice; the popup shares its theme. */
export function NotationSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}) {
  const id = useId();
  return (
    <div className="notation-field">
      <label htmlFor={id}>{label}</label>
      <Select
        items={options}
        value={value}
        onValueChange={(next) => {
          // These musical choices are required; dismissing cannot clear them.
          if (next !== null) onChange(next);
        }}
      >
        <SelectTrigger id={id} className="notation-select-trigger">
          <SelectValue />
        </SelectTrigger>
        <SelectContent
          className="notation-select-content"
          align="start"
          alignItemWithTrigger={false}
        >
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
