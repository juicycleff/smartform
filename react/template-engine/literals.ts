/**
 * Parses a string literal (e.g., 'text' or "text")
 */
export function parseStringLiteral(text: string): {
  value: string;
  isString: boolean;
} {
  if (text.length >= 2) {
    if (text.startsWith("'") && text.endsWith("'")) {
      return { value: text.substring(1, text.length - 1), isString: true };
    }
    if (text.startsWith('"') && text.endsWith('"')) {
      return { value: text.substring(1, text.length - 1), isString: true };
    }
  }
  return { value: "", isString: false };
}

/**
 * Attempts to parse text as a numeric, boolean, or null literal.
 */
export function parseLiteral(text: string): { value: any; isLiteral: boolean } {
  if (text === "true") {
    return { value: true, isLiteral: true };
  }
  if (text === "false") {
    return { value: false, isLiteral: true };
  }
  if (text === "null") {
    return { value: null, isLiteral: true };
  }

  // Try to parse as float
  // Number() is more lenient than parseFloat for checking if it's *only* a number
  if (!isNaN(Number.parseFloat(text)) && isFinite(Number(text))) {
    if (text.includes(".")) {
      return { value: Number.parseFloat(text), isLiteral: true };
    }
    return { value: Number.parseInt(text, 10), isLiteral: true }; // Or parseFloat if all numbers are floats
  }

  return { value: null, isLiteral: false };
}
