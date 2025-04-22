import { ValidationRule, ValidationType } from "../types";

/**
 * Builder for creating validation rules
 */
export class ValidationBuilder {
  /**
   * Create a required validation rule
   */
  public required(message: string): ValidationRule {
    return {
      type: ValidationType.REQUIRED,
      message,
    };
  }

  /**
   * Create a minimum length validation rule
   */
  public minLength(min: number, message: string): ValidationRule {
    return {
      type: ValidationType.MIN_LENGTH,
      message,
      parameters: min,
    };
  }

  /**
   * Create a maximum length validation rule
   */
  public maxLength(max: number, message: string): ValidationRule {
    return {
      type: ValidationType.MAX_LENGTH,
      message,
      parameters: max,
    };
  }

  /**
   * Create a pattern validation rule
   */
  public pattern(pattern: string, message: string): ValidationRule {
    return {
      type: ValidationType.PATTERN,
      message,
      parameters: pattern,
    };
  }

  /**
   * Create a minimum value validation rule
   */
  public min(min: number, message: string): ValidationRule {
    return {
      type: ValidationType.MIN,
      message,
      parameters: min,
    };
  }

  /**
   * Create a maximum value validation rule
   */
  public max(max: number, message: string): ValidationRule {
    return {
      type: ValidationType.MAX,
      message,
      parameters: max,
    };
  }

  /**
   * Create an email validation rule
   */
  public email(message: string): ValidationRule {
    return {
      type: ValidationType.EMAIL,
      message,
    };
  }

  /**
   * Create a URL validation rule
   */
  public url(message: string): ValidationRule {
    return {
      type: ValidationType.URL,
      message,
    };
  }

  /**
   * Create a file type validation rule
   */
  public fileType(allowedTypes: string[], message: string): ValidationRule {
    return {
      type: ValidationType.FILE_TYPE,
      message,
      parameters: allowedTypes,
    };
  }

  /**
   * Create a file size validation rule
   */
  public fileSize(maxSize: number, message: string): ValidationRule {
    return {
      type: ValidationType.FILE_SIZE,
      message,
      parameters: maxSize,
    };
  }

  /**
   * Create an image dimensions validation rule
   */
  public imageDimensions(
    dimensions: Record<string, any>,
    message: string,
  ): ValidationRule {
    return {
      type: ValidationType.IMAGE_DIMENSIONS,
      message,
      parameters: dimensions,
    };
  }

  /**
   * Create a field dependency validation rule
   */
  public dependency(
    field: string,
    operator: string,
    value: any,
    message: string,
  ): ValidationRule {
    return {
      type: ValidationType.DEPENDENCY,
      message,
      parameters: {
        field,
        operator,
        value,
      },
    };
  }

  /**
   * Create a uniqueness validation rule
   */
  public unique(message: string): ValidationRule {
    return {
      type: ValidationType.UNIQUE,
      message,
    };
  }

  /**
   * Create a custom validation rule
   */
  public custom(
    functionName: string,
    params: Record<string, any>,
    message: string,
  ): ValidationRule {
    if (params === null || params === undefined) {
      params = {};
    }
    params.function = functionName;

    return {
      type: ValidationType.CUSTOM,
      message,
      parameters: params,
    };
  }
}

/**
 * Create a new validation builder
 */
export function createValidationBuilder(): ValidationBuilder {
  return new ValidationBuilder();
}
