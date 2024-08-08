import type Dessert from "../Dessert";
import type FlavorOption from "../FlavorOption";

const FlavorOptions: {
  [key in Dessert]: FlavorOption[];
} = {
  iceCream: [
    { value: "chocolate", label: "Chocolate" },
    { value: "rocky-road", label: "Rocky Road" },
    { value: "strawberry", label: "Strawberry" },
    { value: "vanilla", label: "Vanilla" },
  ],
  cake: [
    { value: "chocolate", label: "Chocolate" },
    { value: "strawberry", label: "Strawberry" },
    { value: "vanilla", label: "Vanilla" },
  ],
  pie: [
    { value: "apple", label: "Apple" },
    { value: "cherry", label: "Cherry" },
    { value: "peach", label: "Peach" },
  ],
};

export default FlavorOptions;
