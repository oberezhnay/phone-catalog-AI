// Returns the value when it is one of the allowed options, otherwise undefined.
// Use it for values read from the URL, so they are checked and not cast.
export function parseOption<T extends string>(
  options: readonly T[],
  value: string | null,
): T | undefined {
  return options.find(option => option === value);
}
