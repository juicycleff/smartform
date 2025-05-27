import type { TemplateContext, TemplatePart, VariableRegistry } from "./types"; // Assuming types.ts
import { getValueByPath } from "./utils"; // Assuming utils.ts

export class TextPart implements TemplatePart {
  constructor(public text: string) {}

  evaluate(_registry: VariableRegistry, _context: TemplateContext): any {
    return this.text;
  }
}

export class LiteralPart implements TemplatePart {
  value: any;

  constructor(value: any) {
    this.value = value;
  }

  evaluate(_registry: VariableRegistry, _context: TemplateContext): any {
    return this.value;
  }
}

export class VariablePart implements TemplatePart {
  path: string;

  constructor(path: string) {
    this.path = path;
  }

  evaluate(registry: VariableRegistry, context: TemplateContext): any {
    // Check context first
    const contextValue = getValueByPath(context, this.path);
    if (contextValue !== undefined && contextValue !== null) {
      // More robust check than just `if (contextValue)`
      return contextValue;
    }

    // Check registry variables
    // This simplified version uses the registry's GetVariable which should handle path logic.
    const { value: registryValue, found } = registry.getVariable(this.path);
    if (found) {
      return registryValue;
    }

    // Check for special __coalesce context
    if (context && context["__coalesce"] === true) {
      return null; // Return null to allow coalesce to proceed
    }

    throw new Error(`Variable not found: ${this.path}`);
  }
}

export class FunctionPart implements TemplatePart {
  constructor(
    public name: string,
    public args: TemplatePart[],
  ) {}

  async evaluate(
    registry: VariableRegistry,
    context: TemplateContext,
  ): Promise<any> {
    const { func, found } = registry.getFunction(this.name);
    if (!found || !func) {
      throw new Error(`Function not found: ${this.name}`);
    }

    const evaluatedArgs: any[] = [];
    for (const argPart of this.args) {
      evaluatedArgs.push(await argPart.evaluate(registry, context));
    }

    return func(evaluatedArgs);
  }
}

export class NullCoalescePart implements TemplatePart {
  constructor(
    public left: TemplatePart,
    public right: TemplatePart,
  ) {}

  async evaluate(
    registry: VariableRegistry,
    context: TemplateContext,
  ): Promise<any> {
    let leftVal;
    try {
      // Create a special context for the left evaluation
      const coalesceContext = { ...context, __coalesce: true };
      leftVal = await this.left.evaluate(registry, coalesceContext);
    } catch (e) {
      // Errors in left part evaluation (like variable not found) should lead to evaluating the right part.
      leftVal = null; // Treat as null if evaluation itself fails
    }

    if (leftVal !== null && leftVal !== undefined) {
      if (typeof leftVal === "string" && leftVal === "") {
        // Empty string, proceed to right
      } else {
        return leftVal;
      }
    }
    return this.right.evaluate(registry, context);
  }
}

export class ForEachPart implements TemplatePart {
  constructor(
    public itemVar: string,
    public collection: TemplatePart,
    public body: TemplatePart,
    public indexVar?: string,
  ) {}

  async evaluate(
    registry: VariableRegistry,
    context: TemplateContext,
  ): Promise<string> {
    const collectionValue = await this.collection.evaluate(registry, context);
    let items: any[] = [];

    if (Array.isArray(collectionValue)) {
      items = collectionValue;
    } else if (
      typeof collectionValue === "object" &&
      collectionValue !== null
    ) {
      items = Object.entries(collectionValue).map(([key, value]) => ({
        key,
        value,
      }));
    } else {
      return ""; // Not a collection
    }

    let result = "";
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const loopContext = { ...context };
      loopContext[this.itemVar] = item;
      if (this.indexVar) {
        loopContext[this.indexVar] = i;
      }

      const bodyResult = await this.body.evaluate(registry, loopContext);

      // Skip empty string results for conditional cases within loops
      if (typeof bodyResult === "string" && bodyResult === "") {
        continue;
      }

      result += String(bodyResult);
    }
    return result;
  }
}
