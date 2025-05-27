import { Button } from "../ui/button";
import { cn } from "../../lib/utils";
import { Braces, KeyRound } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useSmartForm } from "../context";
import { AutosuggestTemplateInput } from "./autosuggest-template-input";

interface TemplateModeWrapperProps {
  children: React.ReactNode;
  value: any;
  onChange: (value: any) => void;
  onBlur: () => void;
  path: string;
  useEndContent?: boolean;
  disabled?: boolean;
}

export const TemplateModeWrapper: React.FC<TemplateModeWrapperProps> = ({
  children,
  value,
  onChange,
  onBlur,
  disabled = false,
  useEndContent = true,
}) => {
  const { templateEngine } = useSmartForm(); // formState is not used in the current heuristic
  const [mode, setMode] = useState<"normal" | "template">("normal");
  const [hasInvalidVariables, setHasInvalidVariables] = useState(false);

  useEffect(() => {
    const isCurrentlyTemplate =
      typeof value === "string" && value.includes("${") && value.includes("}");
    if (isCurrentlyTemplate) {
      setMode("template");
    }
  }, [value]);

  useEffect(() => {
    if (mode === "template" && typeof value === "string") {
      let isInvalid = false;
      if (value.includes("${")) {
        const expressions = new Set<string>();
        const variableRegex = /\${(.*?)}/g;
        let match;
        let lastRegexIndex = 0; // Tracks the end of the last successful regex match
        let hasPotentiallyMalformedTemplate = false;

        while ((match = variableRegex.exec(value)) !== null) {
          // Check if there's an unescaped '${' before this valid match that wasn't part of a previous valid match
          if (value.substring(lastRegexIndex, match.index).includes("${")) {
            hasPotentiallyMalformedTemplate = true;
            break;
          }
          expressions.add(match[1].trim());
          lastRegexIndex = match.index + match[0].length;
        }

        // If loop broke due to malformed section
        if (hasPotentiallyMalformedTemplate) {
          isInvalid = true;
        } else {
          // Check for remaining '${' after the last valid match
          if (value.substring(lastRegexIndex).includes("${")) {
            hasPotentiallyMalformedTemplate = true;
          }

          // If no valid expressions were found, but '${' is present and it's not an empty template string (e.g. "${}")
          if (expressions.size === 0 && !/^\${\s*}$/.test(value.trim())) {
            hasPotentiallyMalformedTemplate = true;
          }

          if (hasPotentiallyMalformedTemplate) {
            isInvalid = true;
          } else {
            for (const expr of expressions) {
              if (expr === "") continue; // Skip empty expressions like ${}

              // Regex to extract the first part of an expression, which could be a variable or function name.
              // Matches 'foo' in 'foo.bar', 'foo["bar"]', 'foo()'
              const rootIdentifierMatch = expr.match(/^([a-zA-Z_][\w$_]*)/);
              const rootIdentifier = rootIdentifierMatch
                ? rootIdentifierMatch[0]
                : null;

              if (rootIdentifier) {
                const registry = templateEngine.getVariableRegistry();
                // Assuming registry has getVariable and getFunction methods.
                // These checks might need to be adapted based on the actual TemplateEngine implementation.
                const varExists =
                  typeof registry.getVariable === "function" &&
                  registry.getVariable(rootIdentifier) !== undefined;
                const funcExists =
                  typeof registry.getFunction === "function" &&
                  registry.getFunction(rootIdentifier) !== undefined;

                if (!varExists && !funcExists) {
                  isInvalid = true;
                  break;
                }
              } else {
                // Expression does not start with a valid identifier (e.g., ${123}, ${!invalid}, ${"string"})
                // However, an expression like "${'a string'}" or "${123}" might be valid if it evaluates to a literal.
                // For simplicity, we are currently flagging non-identifier starts as potentially problematic for "missing variables".
                // This part of the logic might be too strict if literal expressions are common and desired.
                // For now, we assume we're primarily looking for variable-based expressions.
                isInvalid = true;
                break;
              }
            }
          }
        }
      }
      setHasInvalidVariables(isInvalid);
    } else {
      setHasInvalidVariables(false);
    }
  }, [value, mode, templateEngine]);

  const toggleModeOnClick = () => {
    const newMode = mode === "normal" ? "template" : "normal";
    handleModeChange(newMode);
  };

  const handleModeChange = (newMode: "normal" | "template" | undefined) => {
    if (!newMode || newMode === mode) return;

    if (newMode === "template") {
      if (
        value === undefined ||
        value === null ||
        String(value).trim() === ""
      ) {
        onChange("${}");
      } else if (typeof value === "string") {
        if (!value.startsWith("${") || !value.endsWith("}")) {
          onChange(`\${${value}}`);
        }
      } else {
        onChange(`\${String(value)}}`);
      }
      setMode("template");
    } else {
      // Switching to 'normal'
      if (typeof value === "string") {
        if (value === "${}") {
          onChange("");
        } else {
          const match = /^\${([\s\S]*)}$/.exec(value);
          if (match && match[1] !== undefined) {
            const innerContent = match[1];
            // Attempt to revert simple variable-like or literal content
            if (
              /^[a-zA-Z_][\w.[\]]*$/.test(innerContent) || // variable like
              (!isNaN(Number(innerContent)) && innerContent.trim() !== "") || // number
              innerContent === "true" ||
              innerContent === "false" || // boolean
              innerContent === "null" // null
            ) {
              onChange(innerContent);
            }
            // else, keep the template string as is, user can edit further
          }
        }
      }
      setMode("normal");
    }
  };

  const originalChild = React.Children.only(
    children,
  ) as React.ReactElement<any>;

  const switcher = () =>
    useEndContent ? (
      <Button
        variant="ghost"
        size="xs"
        onClick={toggleModeOnClick}
        isIconOnly
        disabled={disabled}
        title={
          mode === "normal"
            ? "Switch to Template Expression Mode"
            : "Switch to Normal Text Mode"
        }
        className="rounded-md bg-background/70 backdrop-blur-sm hover:bg-muted/80"
      >
        {mode === "normal" ? (
          <Braces className="h-4 w-4" />
        ) : (
          <KeyRound className="h-4 w-4" />
        )}
      </Button>
    ) : null;

  return (
    <div className="relative w-full">
      <div className="w-full">
        {mode === "template" ? (
          <AutosuggestTemplateInput
            value={typeof value === "string" ? value : String(value ?? "")}
            onChange={onChange}
            onBlur={onBlur}
            templateEngine={templateEngine}
            disabled={disabled}
            placeholder={originalChild.props.placeholder || "Enter template..."}
            className={cn(
              originalChild.props.className,
              "pr-0", // Keep original pr-0 or adjust as needed
              { "text-red-500": hasInvalidVariables }, // Apply red text if invalid variables
            )}
            endContent={switcher()}
          />
        ) : (
          React.cloneElement(originalChild, {
            value: value,
            onChange: (e: React.ChangeEvent<HTMLInputElement> | any) => {
              if (e && typeof e.target === "object" && "value" in e.target) {
                onChange(e.target.value);
              } else {
                onChange(e);
              }
            },
            onBlur: onBlur,
            disabled: disabled,
            endContent: switcher(),
          })
        )}
      </div>

      {!useEndContent && (
        <div className="absolute top-1 right-1 z-10">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleModeOnClick}
            disabled={disabled}
            title={
              mode === "normal"
                ? "Switch to Template Expression Mode"
                : "Switch to Normal Text Mode"
            }
            className="h-7 w-7 rounded-md bg-background/70 p-1 backdrop-blur-sm hover:bg-muted/80"
          >
            {mode === "normal" ? (
              <Braces className="h-4 w-4" />
            ) : (
              <KeyRound className="h-4 w-4" />
            )}
          </Button>
        </div>
      )}
    </div>
  );
};
