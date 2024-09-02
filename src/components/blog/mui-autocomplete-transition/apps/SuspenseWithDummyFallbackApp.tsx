import { Suspense, useState, useTransition } from "react";
import Select, { type SingleValue } from "react-select";
import DessertAutocomplete from "../DessertAutocomplete";
import SuspenseEnabledFlavorAutocomplete from "../SuspenseEnabledFlavorAutocomplete";
import type DessertOption from "../types/DessertOption";
import type FlavorOption from "../types/FlavorOption";

export default function SuspenseWithDummyFallbackApp() {
  const [selectedDessert, setSelectedDessert] = useState<null | DessertOption>(
    null,
  );
  const [selectedFlavor, setSelectedFlavor] = useState<null | FlavorOption>(
    null,
  );
  const [_, startTransition] = useTransition();

  const handleChange = async (newValue: SingleValue<DessertOption>) => {
    startTransition(() => {
      setSelectedDessert(newValue);
      setSelectedFlavor(null);
    });
  };

  return (
    <Suspense fallback="App Loading...">
      <DessertAutocomplete onChange={handleChange} />

      <Suspense
        key={selectedDessert?.value}
        fallback={
          <label>
            Flavor
            <Select
              isLoading
              placeholder={`Select a ${selectedDessert?.label} flavor`}
            />
          </label>
        }
      >
        {selectedDessert && selectedDessert.value !== "famous_cookies" && (
          <SuspenseEnabledFlavorAutocomplete
            onChange={(value) => {
              setSelectedFlavor(value);
            }}
            dessertValue={selectedDessert.value}
            placeholder={`Select a ${selectedDessert.label} flavor`}
            value={selectedFlavor}
          />
        )}
      </Suspense>
    </Suspense>
  );
}
