import {
  type ReactNode,
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
} from "react";
import FlavorOptions from "./constants/FlavorOptions";
import type Dessert from "./types/Dessert";
import type FlavorOption from "./types/FlavorOption";

type FlavorDataContextType = {
  clearCache: () => void;
  fetchData: (dessert: Dessert, delay?: number) => Promise<FlavorOption[]>;
};

const FlavorDataContext = createContext<FlavorDataContextType | null>(null);

export function useFlavorData() {
  const context = useContext(FlavorDataContext);

  if (!context) {
    throw new Error("useFlavorData has to be used within FlavorDataProvider");
  }
  return context;
}

export default function FlavorDataProvider({
  children,
}: {
  children: ReactNode;
}) {
  const cacheRef = useRef(new Map());

  const getFlavors = useCallback(async (dessert: Dessert, delay = 3000) => {
    // Simulate an async operation
    await new Promise<void>((resolve) =>
      setTimeout(() => {
        resolve();
      }, delay),
    );

    // Return the flavors for the given dessert
    return FlavorOptions[dessert];
  }, []);

  const fetchData = useCallback(
    (dessert: Dessert, delay = 3000) => {
      // Check if the cache has the dessert data
      if (!cacheRef.current.has(dessert)) {
        // console.log(`Cache miss for ${dessert}. Fetching data...`);

        const dataPromise = getFlavors(dessert, delay)
          .then((data) => {
            // console.log(`Data fetched for ${dessert}:`, data);

            // Cache the resolved data
            // cache.set(dessert, data);
            return data;
          })
          .catch((error) => {
            // On error, remove the failed entry from the cache
            cacheRef.current.delete(dessert);
            throw error;
          });

        // Cache the promise immediately
        cacheRef.current.set(dessert, dataPromise);
      } else {
        // console.log(`Cache hit for ${dessert}`);
      }

      // Return the cached promise or resolved data
      const cachedValue = cacheRef.current.get(dessert);
      // console.log(`fetchData returning for ${dessert}:`, cachedValue);

      // Ensure that use() receives a promise
      if (cachedValue instanceof Promise) {
        return cachedValue;
      }
      // console.log("wrap in promise");
      // Wrap the resolved data in a Promise
      return Promise.resolve(cachedValue);
    },
    [getFlavors],
  );

  const clearCache = useCallback(() => {
    cacheRef.current = new Map();
  }, []);

  const value = useMemo(() => {
    return {
      clearCache,
      fetchData,
    };
  }, [clearCache, fetchData]);

  return (
    <FlavorDataContext.Provider value={value}>
      {children}
    </FlavorDataContext.Provider>
  );
}
