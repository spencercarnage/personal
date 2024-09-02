import { Suspense, useState } from "react";
import StartTransitionDessert from "../StartTransitionDessert";
import type DessertOption from "../types/DessertOption";

export default function StartTransitionApp({
  showLoadingText = false,
}: { showLoadingText?: boolean }) {
  const [selectedDessert, setSelectedDessert] = useState<null | DessertOption>(
    null,
  );

  return (
    <Suspense fallback="Start Transition App Loading...">
      <StartTransitionDessert
        dessert={selectedDessert}
        onDessertChange={(value) => setSelectedDessert(value)}
        showLoadingText={showLoadingText}
      />
    </Suspense>
  );
}
