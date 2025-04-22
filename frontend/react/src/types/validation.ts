import { ValidationResult } from '@xraph/smartform-core';

export interface ValidationOptions {
  abortEarly?: boolean;
  validateAllFields?: boolean;
}

export {
  ValidationResult,
}

export interface ValidationConfig {
  mode: 'onChange' | 'onBlur' | 'onSubmit' | 'all';
  validateOnMount?: boolean;
  revalidateOnChange?: boolean;
  debounce?: number;
}
