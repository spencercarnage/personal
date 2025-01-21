import { useState, useTransition } from "react";
import type { SingleValue } from "react-select";
import DessertAutocomplete from "./DessertAutocomplete";
import TransitionFlavorAutocomplete from "./TransitionFlavorAutocomplete";
import type DessertOption from "./types/DessertOption";
import type FlavorOption from "./types/FlavorOption";

export default function StartTransitionDessert({
  dessert,
  onDessertChange,
  showLoadingText = false,
}: {
  dessert: null | DessertOption;
  onDessertChange: (dessert: null | DessertOption) => void;
  showLoadingText?: boolean;
}) {
  const [selectedFlavor, setSelectedFlavor] = useState<null | FlavorOption>(
    null,
  );
  const [isPending, startTransition] = useTransition();

  const handleChange = (newValue: SingleValue<DessertOption>) => {
    setSelectedFlavor(null);

    startTransition(() => {
      onDessertChange(newValue);
    });
  };

  return (
    <>
      <DessertAutocomplete onChange={handleChange} />

      {isPending && showLoadingText && "isPending: true"}
      {dessert && dessert.value !== "famous_cookies" && (
        <TransitionFlavorAutocomplete
          key={dessert?.value}
          dessertValue={dessert.value}
          onChange={(value) => {
            setSelectedFlavor(value);
          }}
          placeholder={`Select a ${dessert.label} flavor`}
          value={selectedFlavor}
          loading={isPending}
        />
      )}
    </>
  );
}
