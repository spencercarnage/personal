import { useEffect, useState } from "react";
import Select, { type SingleValue } from "react-select";
import { useFlavorData } from "./FlavorDataProvider";
import type Dessert from "./types/Dessert";
import type FlavorOption from "./types/FlavorOption";

export default function FlavorAutocompleteWithoutUse({
  dessertValue,
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
  const [flavorOptions, setFlavorOptions] = useState<null | FlavorOption[]>(
    null,
  );
  const { fetchData } = useFlavorData();

  useEffect(() => {
    if (dessertValue) {
      setFlavorOptions(null);

      fetchData(dessertValue, 3000).then((flavors: FlavorOption[]) => {
        setFlavorOptions(flavors);
      });
    } else {
      setFlavorOptions(null);
    }
  }, [dessertValue, fetchData]);

  return (
    <label>
      Flavor
      <Select<FlavorOption>
        isLoading={!flavorOptions}
        placeholder={placeholder}
        onChange={(newValue) => {
          onChange(newValue);
        }}
        isClearable
        isSearchable
        name="flavor"
        options={flavorOptions || []}
        value={value}
      />
    </label>
  );
}
