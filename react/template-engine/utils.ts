/**
 * Retrieves a value by path from an object, supporting dot notation and array indices.
 * Example paths: "user.name", "items[0]", "users[0].addresses[1].street"
 * Based on Go's getValueByPath
 */
export function getValueByPath(
  data: Record<string, any> | undefined | null,
  path: string,
): any {
  if (!data || path === '') {
    return undefined
  }

  const arrayAccessRegex = /(\w+)\[(\d+)\]/
  const parts: string[] = []
  const currentPath = path

  // This parsing logic is simplified compared to the Go version's regex loop.
  // A more direct split and process approach:
  // Split by '.' first, then process each part for array access.
  const pathSegments = path.split('.')

  let current: any = data

  for (const segment of pathSegments) {
    if (current === undefined || current === null) return undefined

    const arrayMatch = segment.match(arrayAccessRegex)

    if (arrayMatch) {
      const arrayName = arrayMatch[1]
      const index = Number.parseInt(arrayMatch[2], 10)

      // If arrayName is part of the segment, current should be an object
      let targetArray: any[]
      if (arrayName && typeof current === 'object' && current !== null) {
        targetArray = (current as Record<string, any>)[arrayName]
      } else if (!arrayName && Array.isArray(current)) {
        // If the segment IS an array access directly on current, e.g. path starts with "[0]" (after a previous step)
        // This case needs more robust path splitting if paths like "obj.[0]" are valid.
        // For now, assume arrayName is always present if current is an object.
        targetArray = current // This case needs refinement based on expected path structure.
      } else {
        return undefined // Not an object or array to access
      }

      if (
        !Array.isArray(targetArray) ||
        index < 0 ||
        index >= targetArray.length
      ) {
        return undefined // Not an array or index out of bounds
      }
      current = targetArray[index]
    } else {
      // Regular property access
      if (
        typeof current !== 'object' ||
        current === null ||
        !Object.prototype.hasOwnProperty.call(current, segment)
      ) {
        return undefined // Not an object or property not found
      }
      current = (current as Record<string, any>)[segment]
    }
    // Convert ints to float64 (number in JS) for consistency if needed, though JS handles numbers more generally.
    // The Go version does this. In JS, number type is usually sufficient.
  }
  return current
}

export function isNumber(value: any): boolean {
  return typeof value === 'number' && isFinite(value)
}
