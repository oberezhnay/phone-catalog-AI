import { createContext, useContext } from 'react';

// Creates a context and a hook for it. The hook throws a clear error when it
// is used outside the matching Provider, instead of returning undefined.
export function createRequiredContext<T>(providerName: string) {
  const Context = createContext<T | undefined>(undefined);

  function useRequiredContext(): T {
    const value = useContext(Context);

    if (value === undefined) {
      throw new Error(`use${providerName} must be used within ${providerName}`);
    }

    return value;
  }

  return [Context, useRequiredContext] as const;
}
