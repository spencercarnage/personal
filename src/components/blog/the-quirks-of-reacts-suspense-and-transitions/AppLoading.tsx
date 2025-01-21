import { type ReactNode, use, useEffect, useId } from "react";

const cache = new Map();

const getLoadingState = async (delay: number) => {
  // Simulate an async operation
  await new Promise<void>((resolve) => {
    // console.log("getLoadingState promise");
    setTimeout(() => {
      // console.log("timeout");
      resolve();
    }, delay);
  });

  return true;
};

const loadApp = (id: string, delay: number, cb: () => void) => {
  if (!cache.has(id)) {
    // console.log("not in the cache", id);
    // Cache the promise immediately
    const dataPromise = getLoadingState(delay)
      .then((loadingState) => {
        // console.log("promise return", cache);
        cb();
        return loadingState;
      })
      .catch((error) => {
        cache.delete(id);
        throw error;
      });
    cache.set(id, dataPromise);
  } else {
    // console.log("its in the cache");
  }

  const cachedValue = cache.get(id);
  // console.log("cachedValue", cachedValue);

  return cachedValue;
  // Ensure that use() receives a promise
  // if (cachedValue instanceof Promise) {
  //   return cachedValue;
  // }

  // return Promise.resolve(cachedValue);
};

export default function AppLoading({
  children,
  delay = 2000,
  showMountLogs = false,
  showIdLogs = false,
  id,
}: {
  children: ReactNode;
  delay?: number;
  id: string;
  showIdLogs?: boolean;
  showMountLogs?: boolean;
}) {
  const localId = useId();

  if (showIdLogs) {
    console.log("useId before `use`", localId);
  }

  use(loadApp(id, delay, () => {}));

  if (showIdLogs) {
    console.log("useId after `use`", localId);
  }

  // biome-ignore lint: only delete when unmounting
  useEffect(() => {
    if (showMountLogs) {
      console.log("mount");
    }
    return () => {
      if (showMountLogs) {
        console.log("unmount");
      }
      cache.delete(id);
    };
  }, []);

  return children;
}
