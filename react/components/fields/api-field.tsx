import { Button } from "../ui/button";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { Loader2 } from "lucide-react";
import type React from "react";
import { useState } from "react";
import { useFormContext } from "react-hook-form";
import type { Field } from "../../core";
import { useLogger } from "../../logger";
import { useSmartForm } from "../context";

interface APIFieldProps {
  field: Field;
  path: string;
}

const APIField: React.FC<APIFieldProps> = ({ field, path }) => {
  const log = useLogger();
  const { isFieldEnabled, isFieldRequired } = useSmartForm();
  const { control, setValue } = useFormContext();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const disabled = !isFieldEnabled(field);
  const required = isFieldRequired(field);

  // Function to execute the API request
  const executeRequest = async () => {
    if (!field.properties?.endpoint) {
      setError("No API endpoint specified");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Get endpoint and method from properties
      const endpoint = field.properties.endpoint as string;
      const method = (field.properties.method as string) || "GET";

      // Extract headers
      const headers = new Headers();
      headers.append("Content-Type", "application/json");

      if (
        field.properties.headers &&
        typeof field.properties.headers === "object"
      ) {
        for (const [key, value] of Object.entries(field.properties.headers)) {
          headers.append(key, String(value));
        }
      }

      // Extract parameters
      let url = endpoint;
      let body: string | null = null;

      if (
        field.properties.parameters &&
        typeof field.properties.parameters === "object"
      ) {
        const params = field.properties.parameters as Record<string, any>;

        if (method === "GET") {
          // For GET requests, append parameters to URL
          const queryParams = new URLSearchParams();
          for (const [key, value] of Object.entries(params)) {
            queryParams.append(key, String(value));
          }

          url = `${endpoint}?${queryParams.toString()}`;
        } else {
          // For non-GET requests, add parameters to request body
          body = JSON.stringify(params);
        }
      }

      // Execute the API request
      const response = await fetch(url, {
        method,
        headers,
        body,
      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();

      // Handle response mapping if specified
      if (
        field.properties.responseMapping &&
        typeof field.properties.responseMapping === "object"
      ) {
        const mapping = field.properties.responseMapping as Record<
          string,
          string
        >;

        for (const [targetField, sourcePath] of Object.entries(mapping)) {
          // Extract value from response using path
          const value = getValueByPath(data, sourcePath);

          // Set the value in the form
          setValue(targetField, value);
        }
      } else {
        // Store the entire response in the field value
        setValue(path, data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "API request failed");
      log.error("API request error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to extract a value from a nested object using a path
  const getValueByPath = (obj: any, path: string): any => {
    const parts = path.split(".");
    let current = obj;

    for (const part of parts) {
      if (current === null || current === undefined) {
        return undefined;
      }

      current = current[part];
    }

    return current;
  };

  return (
    <FormField
      control={control}
      name={path}
      render={({ field: formField }) => (
        <FormItem>
          <FormLabel
            className={
              required
                ? 'after:ml-0.5 after:text-red-500 after:content-["*"]'
                : ""
            }
          >
            {field.label}
          </FormLabel>
          <div className="space-y-2">
            <div className="flex space-x-2">
              <FormControl>
                <Input
                  value={formField.value ? JSON.stringify(formField.value) : ""}
                  readOnly
                  placeholder="API response data will appear here"
                  disabled={disabled}
                />
              </FormControl>

              <Button
                type="button"
                onClick={executeRequest}
                disabled={disabled || loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading
                  </>
                ) : (
                  "Execute"
                )}
              </Button>
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}
          </div>
          {field.helpText && (
            <FormDescription>{field.helpText}</FormDescription>
          )}
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default APIField;
