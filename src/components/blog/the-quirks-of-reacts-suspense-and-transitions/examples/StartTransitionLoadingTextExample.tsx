import Example from "../Example";
import FlavorDataProvider from "../FlavorDataProvider";
import StartTransitionApp from "../apps/StartTransitionApp";

export default function StartTransitionLoadingTextExample() {
  return (
    <FlavorDataProvider>
      <Example header="startTransition Loading Text example">
        <StartTransitionApp showLoadingText />
      </Example>
    </FlavorDataProvider>
  );
}
