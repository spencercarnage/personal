import { Suspense, useEffect, useState, useTransition } from "react";
import type { SingleValue } from "react-select";
import DessertAutocomplete from "../DessertAutocomplete";
import TransitionFlavorAutocomplete from "../TransitionFlavorAutocomplete";
import type DessertOption from "../types/DessertOption";
import type FlavorOption from "../types/FlavorOption";

export default function IsPendingConsoleApp() {
  const [selectedDessert, setSelectedDessert] = useState<null | DessertOption>(
    null,
  );
  const [selectedFlavor, setSelectedFlavor] = useState<null | FlavorOption>(
    null,
  );
  const [isPending, startTransition] = useTransition();
  console.log("on render", { isPending });
  useEffect(() => {
    console.log("in useEffect", { isPending });
  }, [isPending]);

  useEffect(() => {
    setTimeout(() => {
      console.clear();
    }, 0);
  }, []);

  const handleChange = (newValue: SingleValue<DessertOption>) => {
    setSelectedFlavor(null);

    startTransition(() => {
      setSelectedDessert(newValue);
    });
  };

  return (
    <Suspense fallback="Start Transition App Loading...">
      <DessertAutocomplete onChange={handleChange} />

      {isPending && "isPending: true"}
      {selectedDessert && selectedDessert.value !== "famous_cookies" && (
        <TransitionFlavorAutocomplete
          key={selectedDessert?.value}
          dessertValue={selectedDessert.value}
          onChange={(value) => {
            setSelectedFlavor(value);
          }}
          placeholder={`Select a ${selectedDessert.label} flavor`}
          value={selectedFlavor}
          loading={isPending}
        />
      )}
    </Suspense>
  );
}
