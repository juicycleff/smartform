export function templateVariableExpression(expression: string): string {
  //
  return `\${${expression}}`;
}

export function variableRef(path: string): string {
  //
  return templateVariableExpression(path);
}

export function functionCall(name: string, ...args: string[]): string {
  //
  const argsStr = args.join(", ");
  return templateVariableExpression(`${name}(${argsStr})`);
}

export function forEachExpression(
  itemVar: string,
  collection: string,
  body: string,
): string {
  //
  return templateVariableExpression(
    `forEach(${itemVar}, ${collection}, ${body})`,
  );
}

export function forEachWithIndexExpression(
  itemVar: string,
  indexVar: string,
  collection: string,
  body: string,
): string {
  //
  return templateVariableExpression(
    `forEach(${itemVar}, ${indexVar}, ${collection}, ${body})`,
  );
}

export function ternaryExpression(
  condition: string,
  trueValue: string,
  falseValue: string,
): string {
  //
  return templateVariableExpression(
    `${condition} ? ${trueValue} : ${falseValue}`,
  );
}

export function nullCoalesceExpression(
  value: string,
  defaultValue: string,
): string {
  //
  return templateVariableExpression(`${value} ?? ${defaultValue}`);
}

export function arrayAccessExpression(array: string, index: number): string {
  //
  return templateVariableExpression(`${array}[${index}]`);
}

/**
 * Creates a conditional value using the 'if' function.
 * From template_utils.go
 */
export function conditionalValue(
  condition: string,
  trueValue: string,
  falseValue: string,
): string {
  //
  return functionCall("if", condition, trueValue, falseValue); //
}

/**
 * Creates a formatted value using the 'format' function.
 * The format string itself should be passed as a string literal (e.g., '"Hello, %s"').
 * From template_utils.go
 */
export function formatValue(format: string, ...args: string[]): string {
  //
  // Ensure the format string is quoted if it's meant to be a literal string in the template expression
  const allArgs = [`"${format}"`, ...args]; //
  return functionCall("format", ...allArgs); //
}
