/**
 * SmartForm TypeScript Core Library - Types
 *
 * Core type definitions for the SmartForm library
 */

// ========================================================================
// CONSTANTS
// ========================================================================

/**
 * Defines the type of form
 */
export const FormType = {
  REGULAR: "regular",
  AUTH: "auth",
} as const;

export type FormType = (typeof FormType)[keyof typeof FormType];

/**
 * Defines the type of field
 */
export const FieldType = {
  TEXT: "text",
  TEXTAREA: "textarea",
  NUMBER: "number",
  SELECT: "select",
  MULTI_SELECT: "multiselect",
  CHECKBOX: "checkbox",
  RADIO: "radio",
  DATE: "date",
  TIME: "time",
  DATETIME: "datetime",
  EMAIL: "email",
  PASSWORD: "password",
  FILE: "file",
  IMAGE: "image",
  GROUP: "group",
  ARRAY: "array",
  ONE_OF: "oneOf",
  ANY_OF: "anyOf",
  SWITCH: "switch",
  SLIDER: "slider",
  RATING: "rating",
  OBJECT: "object",
  RICH_TEXT: "richtext",
  COLOR: "color",
  HIDDEN: "hidden",
  SECTION: "section",
  CUSTOM: "custom",
  API: "api",
  AUTH: "auth",
  BRANCH: "branch",
} as const;

export type FieldType = (typeof FieldType)[keyof typeof FieldType];

/**
 * Defines the type of condition
 */
export const ConditionType = {
  SIMPLE: "simple",
  AND: "and",
  OR: "or",
  NOT: "not",
  EXISTS: "exists",
  EXPRESSION: "expression",
} as const;

export type ConditionType = (typeof ConditionType)[keyof typeof ConditionType];

/**
 * Defines the type of validation
 */
export const ValidationType = {
  REQUIRED: "required",
  REQUIRED_IF: "requiredIf",
  MIN_LENGTH: "minLength",
  MAX_LENGTH: "maxLength",
  PATTERN: "pattern",
  MIN: "min",
  MAX: "max",
  EMAIL: "email",
  URL: "url",
  CUSTOM: "custom",
  UNIQUE: "unique",
  FILE_TYPE: "fileType",
  FILE_SIZE: "fileSize",
  IMAGE_DIMENSIONS: "imageDimensions",
  DEPENDENCY: "dependency",
} as const;

export type ValidationType =
  (typeof ValidationType)[keyof typeof ValidationType];

/**
 * Defines the type of options configuration
 */
export const OptionsType = {
  STATIC: "static",
  DYNAMIC: "dynamic",
  DEPENDENT: "dependent",
} as const;

export type OptionsType = (typeof OptionsType)[keyof typeof OptionsType];

/**
 * Defines the authentication strategy
 */
export const AuthStrategy = {
  OAUTH2: "oauth2",
  BASIC: "basic",
  API_KEY: "apikey",
  JWT: "jwt",
  SAML: "saml",
  CUSTOM: "custom",
} as const;

export type AuthStrategy = (typeof AuthStrategy)[keyof typeof AuthStrategy];

// ========================================================================
// INTERFACES
// ========================================================================

/**
 * Represents a form schema
 */
export interface FormSchema {
  id: string;
  title: string;
  description?: string;
  type?: FormType;
  authType?: AuthStrategy;
  fields: Field[];
  properties?: Record<string, any>;
}

/**
 * Represents a form field
 */
export interface Field {
  id: string;
  type: FieldType;
  label: string;
  required: boolean;
  requiredIf?: Condition;
  visible?: Condition;
  enabled?: Condition;
  defaultValue?: any;
  placeholder?: string;
  helpText?: string;
  validationRules?: ValidationRule[];
  properties?: Record<string, any>;
  order: number;
  options?: OptionsConfig;
  nested?: Field[]; // For group, oneOf, anyOf fields
}

/**
 * Represents a condition for field visibility or enablement
 */
export interface Condition {
  type: ConditionType;
  field?: string;
  value?: any;
  operator?: string;
  conditions?: Condition[];
  expression?: string;
}

/**
 * Represents a validation rule
 */
export interface ValidationRule {
  type: ValidationType;
  message: string;
  parameters?: any;
}

/**
 * Represents an option for select-type fields
 */
export interface Option {
  value: any;
  label: string;
  icon?: string;
}

/**
 * Represents options configuration
 */
export interface OptionsConfig {
  type: OptionsType;
  static?: Option[];
  dynamicSource?: DynamicSource;
  dependency?: OptionsDependency;
}

/**
 * Represents a source for dynamic options
 */
export interface DynamicSource {
  type: string; // 'api' or 'function'
  endpoint?: string;
  method?: string;
  headers?: Record<string, string>;
  parameters?: Record<string, any>;
  valuePath?: string;
  labelPath?: string;
  refreshOn?: string[];
}

/**
 * Represents dependency configuration for options
 */
export interface OptionsDependency {
  field: string;
  valueMap?: Record<string, Option[]>;
  expression?: string;
}

/**
 * Represents a configuration for a dynamic field
 */
export interface DynamicFieldConfig {
  functionName: string;
  arguments?: Record<string, any>;
  transformerName?: string;
  transformerParams?: Record<string, any>;
}

/**
 * Represents a validation error
 */
export interface ValidationError {
  fieldId: string;
  message: string;
  ruleType: string;
}

/**
 * Represents the result of validation
 */
export interface ValidationResult {
  valid: boolean;
  errors?: ValidationError[];
}
