import React, { createContext, useContext } from 'react';
import { FormContextValue } from '../types';

// Create context with an empty default value
export const FormContext = createContext<FormContextValue | undefined>(undefined);

// Custom hook to use the form context
export const useFormContext = <TValues extends Record<string, any> = Record<string, any>>(): FormContextValue<TValues> => {
  const context = useContext(FormContext);

  if (!context) {
    throw new Error('useFormContext must be used within a SmartForm component');
  }

  return context as FormContextValue<TValues>;
};
