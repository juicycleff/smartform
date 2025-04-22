import { Field } from '@xraph/smartform-core';
import { FieldState } from './state';
import { FormContextValue } from './form';

export interface FieldProps<TValue = any> {
  field: Field;
  name: string;
  id: string;
  value: TValue;
  onChange: (value: TValue) => void;
  onBlur: () => void;
  state: FieldState;
  error?: string | string[];
  touched: boolean;
  dirty: boolean;
  disabled: boolean;
  readOnly: boolean;
  required: boolean;
  isVisible: boolean;
  placeholder?: string;
  className?: string;
  context: FormContextValue;
}

export interface FieldRendererProps {
  field: Field;
  name: string;
  context: FormContextValue;
}

export interface FieldArrayHelpers<TItem = any> {
  items: TItem[];
  append: (value: TItem) => void;
  prepend: (value: TItem) => void;
  insert: (index: number, value: TItem) => void;
  remove: (index: number) => void;
  move: (from: number, to: number) => void;
  swap: (indexA: number, indexB: number) => void;
  replace: (index: number, value: TItem) => void;
  update: (index: number, updater: (value: TItem) => TItem) => void;
}

export interface FieldArrayProps<TItem = any> extends FieldProps<TItem[]> {
  helpers: FieldArrayHelpers<TItem>;
}
