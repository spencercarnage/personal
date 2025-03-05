import { Suspense, useState } from "react";
import type { SingleValue } from "react-select";
import AppLoading from "../AppLoading";
import DessertAutocomplete from "../DessertAutocomplete";
import SuspenseEnabledFlavorAutocomplete from "../SuspenseEnabledFlavorAutocomplete";
import type DessertOption from "../types/DessertOption";
import type FlavorOption from "../types/FlavorOption";

export default function AppSuspenseWithFlavorSuspenseApp() {
  const [isAppLoaded, setIsAppLoaded] = useState(false);
  const [selectedDessert, setSelectedDessert] = useState<null | DessertOption>(
    null,
  );
  const [selectedFlavor, setSelectedFlavor] = useState<null | FlavorOption>(
    null,
  );

  const loadApp = () => {
    setIsAppLoaded(true);
  };

  const handleChange = (newValue: SingleValue<DessertOption>) => {
    setSelectedDessert(newValue);
    setSelectedFlavor(null);
  };

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
        <AppLoading id="AppSuspenseWithFlavorSuspense">
          <>
            <DessertAutocomplete onChange={handleChange} />

            <Suspense fallback={`Loading ${selectedDessert?.label} flavors...`}>
              {selectedDessert &&
                selectedDessert.value !== "famous_cookies" && (
                  <SuspenseEnabledFlavorAutocomplete
                    dessertValue={selectedDessert.value}
                    onChange={(value) => {
                      setSelectedFlavor(value);
                    }}
                    placeholder={`Select a ${selectedDessert.label} flavor`}
                    value={selectedFlavor}
                  />
                )}
            </Suspense>
          </>
        </AppLoading>
      )}
    </Suspense>
  );
}
