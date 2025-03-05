import { Suspense, useState } from "react";
import type { SingleValue } from "react-select";
import DessertAutocomplete from "../DessertAutocomplete";
import SuspenseEnabledFlavorAutocomplete from "../SuspenseEnabledFlavorAutocomplete";
import type DessertOption from "../types/DessertOption";
import type FlavorOption from "../types/FlavorOption";

export default function SuspenseWithUseApp() {
  const [selectedDessert, setSelectedDessert] = useState<null | DessertOption>(
    null,
  );
  const [selectedFlavor, setSelectedFlavor] = useState<null | FlavorOption>(
    null,
  );

  const handleChange = (newValue: SingleValue<DessertOption>) => {
    setSelectedDessert(newValue);
    setSelectedFlavor(null);
  };

  return (
    <Suspense fallback="App Loading...">
      <DessertAutocomplete onChange={handleChange} />

      <Suspense fallback={`Loading ${selectedDessert?.label} flavors...`}>
        {selectedDessert && selectedDessert.value !== "famous_cookies" && (
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
    </Suspense>
  );
}
