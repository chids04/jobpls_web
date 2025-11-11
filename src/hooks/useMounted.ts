import { useEffect, useState } from 'react';

/**
 * Hook to track if component has mounted on the client.
 * Useful for preventing hydration mismatches when rendering
 * content that differs between server and client.
 */
export function useMounted(): boolean {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return mounted;
}
