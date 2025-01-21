import { Suspense, useState, useTransition } from "react";
import type { SingleValue } from "react-select";
import DessertAutocomplete from "../DessertAutocomplete";
import NullFlavorSelect from "../NullFlavorSelect";
import type DessertOption from "../types/DessertOption";
import type FlavorOption from "../types/FlavorOption";

export default function IsPendingNullApp() {
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

      <NullFlavorSelect
        key={dessert?.value}
        dessertValue={dessert?.value ?? null}
        onChange={(value: SingleValue<FlavorOption>) => {
          setSelectedFlavor(value);
        }}
        placeholder={`Select a ${dessert?.label} flavor`}
        value={selectedFlavor}
        loading={isPending}
      />
    </Suspense>
  );
}
