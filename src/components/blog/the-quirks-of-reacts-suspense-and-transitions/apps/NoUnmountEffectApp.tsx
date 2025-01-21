import { Suspense, useId, useState } from "react";
import AppLoading from "../AppLoading";

export default function NoUnmountEffectApp() {
  const [isAppLoaded, setIsAppLoaded] = useState(false);
  const loadApp = () => setIsAppLoaded(true);
  const id = useId();

  return (
    <>
      {isAppLoaded && (
        <div>
          <button type="button" onClick={() => setIsAppLoaded(false)}>
            Unmount app
          </button>
        </div>
      )}

      <Suspense key={id} fallback="App Loading...">
        {!isAppLoaded && (
          <div>
            <button type="button" onClick={loadApp}>
              Load app
            </button>
          </div>
        )}
        {isAppLoaded && (
          <AppLoading delay={5000} id="NoUnmountEffectApp" showMountLogs>
            Success! App Has Loaded!
          </AppLoading>
        )}
      </Suspense>
    </>
  );
}
