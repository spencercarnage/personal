import { Suspense, useState } from "react";
import Select from "react-select";
import AsyncFlavorAutocomplete from "./AsyncFlavorAutocomplete";
import type Dessert from "./Dessert";
import FlavorAutocomplete from "./FlavorAutocomplete";
import type FlavorOption from "./FlavorOption";
import SuspenseEnabledFlavorAutocomplete from "./SuspenseEnabledFlavorAutocomplete";

type DessertOption = {
  value: Dessert;
  label: string;
};
const desserts: DessertOption[] = [
  { value: "cake", label: "Cake" },
  { value: "iceCream", label: "Ice Cream" },
  { value: "pie", label: "Pie" },
];

export default function DessertAutocomplete({
  isAsync = false,
  isSuspenseEnabled = false,
}: { isAsync?: boolean; isSuspenseEnabled?: boolean }) {
  let FlavorComponent = FlavorAutocomplete;

  switch (true) {
    case isSuspenseEnabled:
      FlavorComponent = SuspenseEnabledFlavorAutocomplete;
      break;
    case isAsync:
      FlavorComponent = AsyncFlavorAutocomplete;
      break;
    default:
  }

  const [selectedDessert, setSelectedDessert] = useState<null | DessertOption>(
    null,
  );
  const [selectedFlavor, setSelectedFlavor] = useState<null | FlavorOption>(
    null,
  );

  return (
    <>
      <label>
        Dessert
        <Select<DessertOption>
          placeholder="Select a dessert"
          defaultValue={selectedDessert}
          onChange={(newValue) => {
            setSelectedFlavor(null);
            setSelectedDessert(newValue);
          }}
          id="dessert"
          isClearable
          isSearchable
          name="dessert"
          options={desserts}
        />
      </label>

      {selectedDessert?.value &&
        (isSuspenseEnabled ? (
          <Suspense fallback="loading...">
            <FlavorComponent
              dessertValue={selectedDessert.value}
              onChange={(flavor) => {
                setSelectedFlavor(flavor);
              }}
              value={selectedFlavor}
            />
          </Suspense>
        ) : (
          <FlavorComponent
            dessertValue={selectedDessert.value}
            onChange={(flavor) => {
              setSelectedFlavor(flavor);
            }}
            value={selectedFlavor}
          />
        ))}
    </>
  );
}
