import { StrictMode } from "react";
import Example from "../Example";
import FlavorDataProvider from "../FlavorDataProvider";
import NonTransitionApp from "../apps/NonTransitionApp";

export default function NonTransitionExample() {
  return (
    <StrictMode>
      <FlavorDataProvider>
        <Example header="Transition-less example">
          <NonTransitionApp />
        </Example>
      </FlavorDataProvider>
    </StrictMode>
  );
}
