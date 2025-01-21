import { useState } from "react";
import type { SingleValue } from "react-select";
import DessertAutocomplete from "../DessertAutocomplete";
import FlavorAutocompleteWithoutUse from "../FlavorAutocompleteWithoutUse";
import type DessertOption from "../types/DessertOption";
import type FlavorOption from "../types/FlavorOption";

export default function NonTransitionApp() {
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
    <>
      <DessertAutocomplete onChange={handleChange} />

      {selectedDessert && selectedDessert.value !== "famous_cookies" && (
        <FlavorAutocompleteWithoutUse
          dessertValue={selectedDessert?.value}
          onChange={(value) => {
            setSelectedFlavor(value);
          }}
          placeholder={`Select a ${selectedDessert?.label} flavor`}
          value={selectedFlavor}
        />
      )}
    </>
  );
}
