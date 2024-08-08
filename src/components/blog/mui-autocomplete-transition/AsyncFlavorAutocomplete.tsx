import { useEffect, useState } from "react";
import Select, { type SingleValue } from "react-select";
import type Dessert from "./Dessert";
import type FlavorOption from "./FlavorOption";
import FlavorOptions from "./constants/FlavorOptions";

export default function AsyncFlavorAutocomplete({
  dessertValue,
  onChange,
  value,
}: {
  dessertValue: Dessert;
  onChange: (value: SingleValue<FlavorOption>) => void;
  value: null | FlavorOption;
}) {
  const [flavorOptions, setFlavorOptions] = useState<FlavorOption[]>([]);

  useEffect(() => {
    setFlavorOptions([]);

    setTimeout(() => {
      setFlavorOptions(FlavorOptions[dessertValue]);
    }, 2000);
  }, [dessertValue]);

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
