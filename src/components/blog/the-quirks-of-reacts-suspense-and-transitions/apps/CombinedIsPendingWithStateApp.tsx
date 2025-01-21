import { Suspense, useState, useTransition } from "react";
import type { SingleValue } from "react-select";
import DessertAutocomplete from "../DessertAutocomplete";
import TransitionFlavorAutocomplete from "../TransitionFlavorAutocomplete";
import type DessertOption from "../types/DessertOption";
import type FlavorOption from "../types/FlavorOption";

export default function CombinedIsPendingWithStateApp({
  showLoadingText = false,
}: {
  showLoadingText?: boolean;
}) {
  const [dessert, setDessert] = useState<null | DessertOption>(null);
  const [selectedFlavor, setSelectedFlavor] = useState<null | FlavorOption>(
    null,
  );
  const [isPending, startTransition] = useTransition();

  const handleChange = (newValue: SingleValue<DessertOption>) => {
    setSelectedFlavor(null);

    startTransition(() => {
      setDessert(newValue);
    });
  };

  return (
    <Suspense fallback="Start Transition App Loading...">
      <DessertAutocomplete onChange={handleChange} />

      {isPending && showLoadingText && "isPending: true"}

      {isPending ||
        (dessert && dessert.value !== "famous_cookies" && (
          <TransitionFlavorAutocomplete
            key={dessert?.value}
            dessertValue={dessert.value}
            onChange={(value: SingleValue<FlavorOption>) => {
              setSelectedFlavor(value);
            }}
            placeholder={`Select a ${dessert.label} flavor`}
            value={selectedFlavor}
            loading={isPending}
          />
        ))}
    </Suspense>
  );
}
