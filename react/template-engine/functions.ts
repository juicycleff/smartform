// Helper from functions.go
export function toNumber(value: any): number {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const num = Number.parseFloat(value);
    if (!isNaN(num)) return num;
    throw new Error(
      `string value '${value}' is not numeric and cannot be converted to a number`,
    );
  }
  if (typeof value === "boolean") return value ? 1 : 0; // Common conversion
  throw new Error(
    `value ${value} (type ${typeof value}) is not numeric and cannot be converted to a number`,
  );
}

export function funcIf(args: any[]): any {
  //
  if (args.length !== 3)
    throw new Error(
      "if function requires 3 arguments: condition, trueValue, falseValue",
    );
  let condition = args[0];
  // Truthiness in JS is often sufficient, but to mirror Go's specific bool conversion:
  if (typeof condition !== "boolean") {
    if (condition === null || condition === undefined) condition = false;
    else if (typeof condition === "number") condition = condition !== 0;
    else if (typeof condition === "string") condition = condition !== "";
    else condition = Boolean(condition); // General JS truthiness for other types
  }
  return condition ? args[1] : args[2];
}

export function funcEquals(args: any[]): boolean {
  //
  if (args.length !== 2) throw new Error("eq function requires 2 arguments");
  // JS loose equality `==` might be closer to some of Go's flexible comparisons,
  // but strict equality `===` is generally safer.
  // The Go version has special numeric handling.
  const a = args[0];
  const b = args[1];
  if (typeof a === "number" && typeof b === "number") return a === b;
  if (
    (typeof a === "number" || typeof a === "string") &&
    (typeof b === "number" || typeof b === "string")
  ) {
    // Attempt numeric comparison if one is string and other is number after conversion
    const numA = typeof a === "string" ? toNumber(a) : a;
    const numB = typeof b === "string" ? toNumber(b) : b;
    if (!isNaN(numA) && !isNaN(numB)) return numA === numB;
  }
  return a === b; // Fallback to strict equality
}

export function funcNotEquals(args: any[]): boolean {
  //
  if (args.length !== 2) throw new Error("ne function requires 2 arguments");
  // Similar logic to funcEquals for consistency
  const a = args[0];
  const b = args[1];
  if (typeof a === "number" && typeof b === "number") return a !== b;
  if (
    (typeof a === "number" || typeof a === "string") &&
    (typeof b === "number" || typeof b === "string")
  ) {
    const numA = typeof a === "string" ? toNumber(a) : a;
    const numB = typeof b === "string" ? toNumber(b) : b;
    if (!isNaN(numA) && !isNaN(numB)) return numA !== numB;
  }
  return a !== b;
}

export function funcGreaterThan(args: any[]): boolean {
  //
  if (args.length !== 2) throw new Error("gt function requires 2 arguments");
  const n1 = toNumber(args[0]);
  const n2 = toNumber(args[1]);
  if (isNaN(n1) || isNaN(n2)) {
    // Fallback to string comparison if not both numbers
    if (typeof args[0] === "string" && typeof args[1] === "string") {
      return args[0] > args[1];
    }
    throw new Error(
      `Incomparable types for gt: ${typeof args[0]} and ${typeof args[1]}`,
    );
  }
  return n1 > n2;
}
export function funcLessThan(args: any[]): boolean {
  /* ... similar to gt ... */ //
  if (args.length !== 2) throw new Error("lt function requires 2 arguments");
  const n1 = toNumber(args[0]);
  const n2 = toNumber(args[1]);
  if (isNaN(n1) || isNaN(n2)) {
    if (typeof args[0] === "string" && typeof args[1] === "string") {
      return args[0] < args[1];
    }
    throw new Error(
      `Incomparable types for lt: ${typeof args[0]} and ${typeof args[1]}`,
    );
  }
  return n1 < n2;
}
export function funcGreaterThanOrEqual(args: any[]): boolean {
  /* ... */ //
  if (args.length !== 2) throw new Error("gte function requires 2 arguments");
  const n1 = toNumber(args[0]);
  const n2 = toNumber(args[1]);
  if (isNaN(n1) || isNaN(n2)) {
    if (typeof args[0] === "string" && typeof args[1] === "string") {
      return args[0] >= args[1];
    }
    throw new Error(
      `Incomparable types for gte: ${typeof args[0]} and ${typeof args[1]}`,
    );
  }
  return n1 >= n2;
}
export function funcLessThanOrEqual(args: any[]): boolean {
  /* ... */ //
  if (args.length !== 2) throw new Error("lte function requires 2 arguments");
  const n1 = toNumber(args[0]);
  const n2 = toNumber(args[1]);
  if (isNaN(n1) || isNaN(n2)) {
    if (typeof args[0] === "string" && typeof args[1] === "string") {
      return args[0] <= args[1];
    }
    throw new Error(
      `Incomparable types for lte: ${typeof args[0]} and ${typeof args[1]}`,
    );
  }
  return n1 <= n2;
}

export function funcAdd(args: any[]): number {
  //
  if (args.length < 2) throw new Error("add requires at least 2 arguments");
  return args.reduce((sum, current) => sum + toNumber(current), 0);
}
export function funcSubtract(args: any[]): number {
  //
  if (args.length !== 2)
    throw new Error("subtract requires exactly 2 arguments");
  return toNumber(args[0]) - toNumber(args[1]);
}
export function funcMultiply(args: any[]): number {
  //
  if (args.length < 2)
    throw new Error("multiply requires at least 2 arguments");
  return args.reduce((prod, current) => prod * toNumber(current), 1);
}
export function funcDivide(args: any[]): number {
  //
  if (args.length !== 2) throw new Error("divide requires exactly 2 arguments");
  const divisor = toNumber(args[1]);
  if (divisor === 0) throw new Error("division by zero");
  return toNumber(args[0]) / divisor;
}
export function funcModulo(args: any[]): number {
  //
  if (args.length !== 2) throw new Error("mod requires exactly 2 arguments");
  const divisor = toNumber(args[1]);
  if (divisor === 0) throw new Error("modulo by zero");
  return toNumber(args[0]) % divisor;
}
export function funcRound(args: any[]): number {
  //
  if (args.length < 1 || args.length > 2)
    throw new Error("round requires 1 or 2 arguments");
  const num = toNumber(args[0]);
  const decimals = args.length === 2 ? toNumber(args[1]) : 0;
  const factor = Math.pow(10, decimals);
  return Math.round(num * factor) / factor;
}

export function funcConcat(args: any[]): string {
  //
  return args.map(String).join("");
}
export function funcLength(args: any[]): number {
  //
  if (args.length !== 1) throw new Error("length requires exactly 1 argument");
  const val = args[0];
  if (typeof val === "string" || Array.isArray(val)) return val.length;
  if (typeof val === "object" && val !== null) return Object.keys(val).length;
  throw new Error("cannot get length of this type");
}
export function funcSubstring(args: any[]): string {
  //
  if (args.length < 2 || args.length > 3)
    throw new Error("substring requires 2 or 3 arguments");
  const str = String(args[0]);
  const start = Math.max(0, toNumber(args[1]));
  if (args.length === 2) return str.substring(start);
  const end = toNumber(args[2]);
  return str.substring(start, end);
}
export function funcToLower(args: any[]): string {
  //
  if (args.length !== 1) throw new Error("toLower requires exactly 1 argument");
  return String(args[0]).toLowerCase();
}
export function funcToUpper(args: any[]): string {
  //
  if (args.length !== 1) throw new Error("toUpper requires exactly 1 argument");
  return String(args[0]).toUpperCase();
}
export function funcTrim(args: any[]): string {
  //
  if (args.length !== 1) throw new Error("trim requires exactly 1 argument");
  return String(args[0]).trim();
}

export function funcJoin(args: any[]): string {
  //
  if (args.length !== 2) throw new Error("join requires exactly 2 arguments");
  if (!Array.isArray(args[0]))
    throw new Error("first argument must be an array");
  return args[0].map(String).join(String(args[1]));
}
export function funcFirst(args: any[]): any {
  //
  if (args.length !== 1) throw new Error("first requires exactly 1 argument");
  if (!Array.isArray(args[0])) throw new Error("argument must be an array");
  return args[0].length > 0 ? args[0][0] : null;
}
export function funcLast(args: any[]): any {
  //
  if (args.length !== 1) throw new Error("last requires exactly 1 argument");
  if (!Array.isArray(args[0])) throw new Error("argument must be an array");
  return args[0].length > 0 ? args[0][args[0].length - 1] : null;
}
export function funcCount(args: any[]): number {
  //
  if (args.length !== 1) throw new Error("count requires exactly 1 argument");
  if (!Array.isArray(args[0])) throw new Error("argument must be an array");
  return args[0].length;
}

export function funcToString(args: any[]): string {
  //
  if (args.length !== 1)
    throw new Error("toString requires exactly 1 argument");
  return String(args[0]);
}
export function funcToNumber(args: any[]): number {
  //
  if (args.length !== 1)
    throw new Error("toNumber requires exactly 1 argument");
  return toNumber(args[0]); // Uses the helper
}
export function funcToBool(args: any[]): boolean {
  //
  if (args.length !== 1) throw new Error("toBool requires exactly 1 argument");
  const val = args[0];
  if (typeof val === "boolean") return val;
  if (typeof val === "number") return val !== 0;
  if (typeof val === "string") {
    const lower = val.toLowerCase();
    return lower === "true" || lower === "yes" || lower === "1";
  }
  return Boolean(val); // General JS truthiness for other non-empty/non-null values
}

export function funcDefault(args: any[]): any {
  //
  if (args.length !== 2)
    throw new Error("default requires exactly 2 arguments");
  const value = args[0];
  const defaultValue = args[1];
  if (
    value === null ||
    value === undefined ||
    (typeof value === "string" && value === "")
  ) {
    return defaultValue;
  }
  return value;
}
export function funcCoalesce(args: any[]): any {
  //
  if (args.length < 1) throw new Error("coalesce requires at least 1 argument");
  for (const arg of args) {
    if (arg !== null && arg !== undefined) {
      if (typeof arg === "string" && arg === "") continue; // Skip empty strings
      return arg;
    }
  }
  return args.length > 0 ? args[args.length - 1] : null; // Return last if all are null/empty, or null if no args
}

export function funcNow(args: any[]): Date {
  //
  if (args.length !== 0) throw new Error("now function takes no arguments");
  return new Date();
}

export function funcFormatDate(args: any[]): string {
  //
  if (args.length < 1 || args.length > 2)
    throw new Error("formatDate requires 1 or 2 arguments");
  const dateInput = args[0];
  const formatStr = args.length === 2 ? String(args[1]) : "yyyy-MM-dd"; // Default format

  let dateObj: Date;
  if (dateInput instanceof Date) {
    dateObj = dateInput;
  } else if (typeof dateInput === "string" || typeof dateInput === "number") {
    dateObj = new Date(dateInput);
    if (isNaN(dateObj.getTime())) {
      throw new Error("Invalid date value for formatDate");
    }
  } else {
    throw new Error(
      "First argument to formatDate must be a date, string, or number",
    );
  }

  // Basic date formatting (a proper library like date-fns or moment would be better for complex formats)
  // This is a simplified version. Go's "2006-01-02" is a reference layout.
  // JavaScript's Date methods or a library are needed for flexible formatting.
  // Example for "yyyy-MM-dd":
  const year = dateObj.getFullYear();
  const month = (dateObj.getMonth() + 1).toString().padStart(2, "0");
  const day = dateObj.getDate().toString().padStart(2, "0");
  const hours = dateObj.getHours().toString().padStart(2, "0");
  const minutes = dateObj.getMinutes().toString().padStart(2, "0");
  const seconds = dateObj.getSeconds().toString().padStart(2, "0");

  let result = formatStr;
  result = result.replace(/yyyy/g, String(year));
  result = result.replace(/MM/g, month);
  result = result.replace(/dd/g, day);
  result = result.replace(/HH/g, hours);
  result = result.replace(/mm/g, minutes);
  result = result.replace(/ss/g, seconds);
  // Add more replacements as needed (e.g., yy, M, d, H, m, s)

  return result;
}

export function funcAddDays(args: any[]): Date {
  //
  if (args.length !== 2) throw new Error("addDays requires 2 arguments");
  const dateInput = args[0];
  const daysToAdd = toNumber(args[1]);

  let dateObj: Date;
  if (dateInput instanceof Date) {
    dateObj = new Date(dateInput.getTime()); // Clone to avoid modifying original
  } else if (typeof dateInput === "string" || typeof dateInput === "number") {
    dateObj = new Date(dateInput);
    if (isNaN(dateObj.getTime())) {
      throw new Error("Invalid date value for addDays");
    }
  } else {
    throw new Error(
      "First argument to addDays must be a date, string, or number",
    );
  }
  dateObj.setDate(dateObj.getDate() + daysToAdd);
  return dateObj;
}

export function funcAnd(args: any[]): boolean {
  //
  if (args.length === 0) return true; // Consistent with Go
  for (const arg of args) {
    // JS truthiness: null, undefined, false, 0, NaN, "" are falsy
    if (!arg) return false;
  }
  return true;
}
export function funcOr(args: any[]): boolean {
  //
  if (args.length === 0) return false; // Consistent with Go
  for (const arg of args) {
    if (arg) return true;
  }
  return false;
}

export function funcFormat(args: any[]): string {
  //
  if (args.length < 1)
    throw new Error("format function requires at least 1 argument");
  const formatString = String(args[0]);
  const values = args.slice(1);

  // Very basic %s, %d, %f, %j (JSON) support. Not as robust as Go's fmt.Sprintf.
  // For a full port, a sprintf-js library would be better.
  let i = 0;
  return formatString.replace(/%[sdfj%]/g, (match) => {
    if (match === "%%") return "%";
    if (i >= values.length) return match; // Not enough arguments
    const value = values[i++];
    switch (match) {
      case "%s":
        return String(value);
      case "%d":
        return String(Math.floor(Number(value)));
      case "%f":
        return String(Number(value));
      case "%j":
        return JSON.stringify(value);
      default:
        return match;
    }
  });
}

// ... other functions from functions.go
