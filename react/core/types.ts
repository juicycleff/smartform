/**
 * Represents the type of form
 */
export enum FormType {
  Regular = "regular", // Standard form
  Auth = "auth", // Authentication form
}

/**
 * Represents the type of form field
 */
export enum FieldType {
  Text = "text",
  Textarea = "textarea",
  Number = "number",
  Select = "select",
  MultiSelect = "multiselect",
  Checkbox = "checkbox",
  Radio = "radio",
  Date = "date",
  Time = "time",
  DateTime = "datetime",
  Email = "email",
  Password = "password",
  File = "file",
  Image = "image",
  Group = "group",
  Array = "array",
  OneOf = "oneOf",
  AnyOf = "anyOf",
  Switch = "switch",
  Slider = "slider",
  Rating = "rating",
  Object = "object",
  RichText = "richtext",
  Color = "color",
  Hidden = "hidden",
  Section = "section", // For visual separation
  Custom = "custom", // For custom components
  API = "api", // For API integration
  Auth = "auth", // For authentication fields
  Branch = "branch", // For workflow branches
}

/**
 * Represents the type of condition for field visibility, enablement, etc.
 */
export enum ConditionType {
  Simple = "simple", // Simple field comparison
  And = "and", // Logical AND of multiple conditions
  Or = "or", // Logical OR of multiple conditions
  Not = "not", // Logical NOT of a condition
  Exists = "exists", // Field exists and is not empty
  Expression = "expression", // Custom expression
}

/**
 * Represents the type of validation for field values
 */
export enum ValidationType {
  Required = "required",
  RequiredIf = "requiredIf",
  MinLength = "minLength",
  MaxLength = "maxLength",
  Pattern = "pattern",
  Min = "min",
  Max = "max",
  Email = "email",
  URL = "url",
  Custom = "custom",
  Unique = "unique",
  FileType = "fileType",
  FileSize = "fileSize",
  ImageDimensions = "imageDimensions",
  Dependency = "dependency",
}

/**
 * Defines how options are sourced for select-type fields
 */
export enum OptionsType {
  Static = "static", // Hardcoded options
  Dynamic = "dynamic", // Dynamically loaded options
  Dependent = "dependent", // Options depend on another field
}

/**
 * Defines the available authentication strategies
 */
export enum AuthStrategy {
  OAuth2 = "oauth2",
  Basic = "basic",
  APIKey = "apikey",
  JWT = "jwt",
  SAML = "saml",
  Custom = "custom",
}

/**
 * Represents a single option for select-type fields
 */
export interface Option {
  value: any;
  label: string;
  icon?: string;
}

/**
 * Represents a condition for field visibility, enablement, etc.
 */
export interface Condition {
  type: ConditionType;
  field?: string; // Reference to another field
  value?: any; // Static value for comparison
  operator?: string; // eq, neq, gt, lt, etc.
  conditions?: Condition[]; // For AND/OR conditions
  expression?: string; // For custom expressions
  message?: string;
}

/**
 * Represents a validation rule for a field
 */
export interface ValidationRule {
  type: ValidationType;
  message: string;
  parameters?: any; // Type-specific parameters
}

/**
 * Defines where to get dynamic options from
 */
export interface DynamicSource {
  type: string; // api, function, etc.
  endpoint?: string;
  method?: string;
  headers?: Record<string, string>;
  parameters?: Record<string, any>;
  valuePath?: string; // JSON path to value in response
  labelPath?: string; // JSON path to label in response
  refreshOn?: string[]; // Fields that trigger refresh
  functionName?: string;
  functionConfig?: DynamicFieldConfig;
  directFunction?: DynamicFunction; // Not serialized to JSON
}

/**
 * Defines how options depend on other field values
 */
export interface OptionsDependency {
  field: string;
  valueMap?: Record<string, Option[]>;
  expression?: string;
}

/**
 * Configuration for field options (select, multiselect, etc.)
 */
export interface OptionsConfig {
  type: OptionsType;
  static?: Option[];
  dynamicSource?: DynamicSource;
  dependency?: OptionsDependency;
}

/**
 * Configuration for dynamic field functions
 */
export interface DynamicFieldConfig {
  functionName: string;
  arguments?: Record<string, any>;
  transformerName?: string;
  transformerParams?: Record<string, any>;
}

/**
 * A function that can be called at runtime
 */
export type DynamicFunction = (
  args: Record<string, any>,
  formState: Record<string, any>,
) => Promise<any> | any;

/**
 * A function that transforms data
 */
export type DataTransformer = (
  data: any,
  params: Record<string, any>,
) => Promise<any> | any;

export interface DefaultWhen {
  condition: Condition;
  value: any;
}

/**
 * Represents a single form field with all its properties
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
  defaultWhen?: DefaultWhen[];
  placeholder?: string;
  helpText?: string;
  validationRules?: ValidationRule[];
  properties?: Record<string, any>;
  order: number;
  options?: OptionsConfig;
  nested?: Field[]; // For group, oneOf, anyOf fields
}

/**
 * Represents a validation error for a specific field
 */
export interface ValidationError {
  fieldId: string;
  message: string;
  ruleType: string;
}

/**
 * Holds the result of validating the entire form
 */
export interface ValidationResult {
  valid: boolean;
  errors?: ValidationError[];
}

/**
 * Represents the entire form structure
 */
export interface FormSchema {
  id: string;
  title: string;
  description?: string;
  type: FormType;
  authType?: AuthStrategy; // Auth type if this is an auth form
  fields: Field[];
  properties?: Record<string, any>;
}
