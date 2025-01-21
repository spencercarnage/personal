import { Suspense, useId, useState } from "react";
import AppLoading from "../AppLoading";

export default function UseIdChangingApp() {
  const [isAppLoaded, setIsAppLoaded] = useState(false);
  const loadApp = () => setIsAppLoaded(true);
  const id = useId();

  return (
    <Suspense fallback="App Loading...">
      {!isAppLoaded && (
        <div>
          <button type="button" onClick={loadApp}>
            Load app
          </button>
        </div>
      )}
      {isAppLoaded && (
        <AppLoading delay={5000} id={`${id}-UseIdChangingApp`} showIdLogs>
          Success! App Has Loaded!
        </AppLoading>
      )}
    </Suspense>
  );
}
