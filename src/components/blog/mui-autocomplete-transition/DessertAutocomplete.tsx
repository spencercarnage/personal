import Select, { type SingleValue } from "react-select";
import type Dessert from "./types/Dessert";
import type DessertOption from "./types/DessertOption";

const desserts: DessertOption[] = [
  { value: "cake", label: "Cake" },
  { value: "iceCream", label: "Ice Cream" },
  { value: "pie", label: "Pie" },
  { value: "famous_cookies", label: "Mom's Famouse Chocolate Chip Cookies" },
];

export default function DessertAutocomplete({
  onChange,
}: { onChange: (value: SingleValue<DessertOption>) => void; value?: Dessert }) {
  return (
    <label>
      Dessert
      <Select<DessertOption>
        placeholder="Select a dessert"
        onChange={(newValue) => {
          onChange(newValue);
        }}
        id="dessert"
        isClearable
        isSearchable
        name="dessert"
        options={desserts}
      />
    </label>
  );
}
