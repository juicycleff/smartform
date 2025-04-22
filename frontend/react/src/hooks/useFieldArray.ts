import { useCallback } from 'react';
import { FieldArrayHelpers } from '../types';

interface UseFieldArrayOptions<TItem = any> {
  name: string;
  value: TItem[];
  onChange: (value: TItem[]) => void;
}

export function useFieldArray<TItem = any>({
  name,
  value = [],
  onChange,
}: UseFieldArrayOptions<TItem>): FieldArrayHelpers<TItem> {
  const items = value;

  const append = useCallback((item: TItem) => {
    onChange([...value, item]);
  }, [value, onChange]);

  const prepend = useCallback((item: TItem) => {
    onChange([item, ...value]);
  }, [value, onChange]);

  const insert = useCallback((index: number, item: TItem) => {
    const newValue = [...value];
    newValue.splice(index, 0, item);
    onChange(newValue);
  }, [value, onChange]);

  const remove = useCallback((index: number) => {
    const newValue = [...value];
    newValue.splice(index, 1);
    onChange(newValue);
  }, [value, onChange]);

  const move = useCallback((from: number, to: number) => {
    if (from === to) return;

    const newValue = [...value];
    const item = newValue[from];
    newValue.splice(from, 1);
    newValue.splice(to, 0, item);
    onChange(newValue);
  }, [value, onChange]);

  const swap = useCallback((indexA: number, indexB: number) => {
    if (indexA === indexB) return;

    const newValue = [...value];
    const itemA = newValue[indexA];
    const itemB = newValue[indexB];
    newValue[indexA] = itemB;
    newValue[indexB] = itemA;
    onChange(newValue);
  }, [value, onChange]);

  const replace = useCallback((index: number, item: TItem) => {
    const newValue = [...value];
    newValue[index] = item;
    onChange(newValue);
  }, [value, onChange]);

  const update = useCallback((index: number, updater: (value: TItem) => TItem) => {
    const newValue = [...value];
    newValue[index] = updater(newValue[index]);
    onChange(newValue);
  }, [value, onChange]);

  return {
    items,
    append,
    prepend,
    insert,
    remove,
    move,
    swap,
    replace,
    update,
  };
}
