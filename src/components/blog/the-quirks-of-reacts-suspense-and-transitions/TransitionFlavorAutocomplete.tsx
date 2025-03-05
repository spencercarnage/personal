import { use } from "react";
import Select, { type SingleValue } from "react-select";
import { useFlavorData } from "./FlavorDataProvider";
import type Dessert from "./types/Dessert";
import type FlavorOption from "./types/FlavorOption";

export default function TransitionFlavorAutocomplete({
  dessertValue,
  loading = false,
  onChange,
  placeholder = "Select a flavor",
  value,
}: {
  dessertValue: Dessert;
  loading?: boolean;
  onChange: (value: SingleValue<FlavorOption>) => void;
  placeholder?: string;
  value: null | FlavorOption;
}) {
  const { fetchData } = useFlavorData();
  const flavorOptions = use(fetchData(dessertValue));

  return (
    <label>
      Flavor
      <Select<FlavorOption>
        placeholder={placeholder}
        value={value}
        onChange={(newValue) => {
          onChange(newValue);
        }}
        isClearable
        isSearchable
        name="flavor"
        isLoading={loading}
        options={flavorOptions}
      />
    </label>
  );
}
