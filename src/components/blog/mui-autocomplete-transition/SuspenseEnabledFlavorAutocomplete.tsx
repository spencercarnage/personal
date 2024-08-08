import Select, { type SingleValue } from "react-select";
import type Dessert from "./Dessert";
import type FlavorOption from "./FlavorOption";
import { fetchData, use } from "./hooks/useFetchFlavors";

export default function SuspenseEnabledFlavorAutocomplete({
  dessertValue,
  onChange,
  value,
}: {
  dessertValue: Dessert;
  onChange: (value: SingleValue<FlavorOption>) => void;
  value: null | FlavorOption;
}) {
  const flavorOptions = use(fetchData(dessertValue));

  return (
    <label>
      Flavor
      <Select<FlavorOption>
        id="flavor"
        placeholder="Select a flavor"
        defaultValue={value}
        onChange={(newValue) => {
          onChange(newValue);
        }}
        isClearable
        isSearchable
        name="flavor"
        options={flavorOptions}
        isLoading={!flavorOptions.length}
      />
    </label>
  );
}
