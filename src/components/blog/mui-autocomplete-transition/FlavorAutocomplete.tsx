import Select, { type SingleValue } from "react-select";
import FlavorOptions from "./constants/FlavorOptions";
import type Dessert from "./types/Dessert";
import type FlavorOption from "./types/FlavorOption";

export default function FlavorAutocomplete({
  dessertValue,
  onChange,
  value,
}: {
  dessertValue: Dessert;
  onChange: (value: SingleValue<FlavorOption>) => void;
  value: null | FlavorOption;
}) {
  return (
    <label>
      Flavor
      <Select<FlavorOption>
        placeholder="Select a flavor"
        defaultValue={value}
        onChange={(newValue) => {
          onChange(newValue);
        }}
        isClearable
        isSearchable
        name="flavor"
        options={FlavorOptions[dessertValue]}
      />
    </label>
  );
}
