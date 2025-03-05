import { use } from "react";
import Select, { type SingleValue } from "react-select";
import { useFlavorData } from "./FlavorDataProvider";
import type Dessert from "./types/Dessert";
import type FlavorOption from "./types/FlavorOption";

export default function SuspenseEnabledFlavorAutocomplete({
  dessertValue,
  onChange,
  placeholder = "Select a flavor",
  value,
}: {
  dessertValue: Dessert;
  placeholder?: string;
  onChange: (value: SingleValue<FlavorOption>) => void;
  value: null | FlavorOption;
}) {
  const { fetchData } = useFlavorData();
  const flavorOptions = use(fetchData(dessertValue));

  return (
    <label>
      Flavor
      <Select<FlavorOption>
        id="flavor"
        placeholder={placeholder}
        onChange={(newValue) => {
          onChange(newValue);
        }}
        isClearable
        isSearchable
        name="flavor"
        options={flavorOptions || []}
        isLoading={!flavorOptions?.length}
        value={value}
      />
    </label>
  );
}
