import type Dessert from "../types/Dessert";
import type FlavorOption from "../types/FlavorOption";

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
    { value: "pecan", label: "Pecan" },
    { value: "lemon-meringue", label: "Lemon Meringue" },
  ],
};

export default FlavorOptions;
