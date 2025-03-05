import Example from "../Example";
import FlavorDataProvider from "../FlavorDataProvider";
import StartTransitionApp from "../apps/StartTransitionApp";

export default function StartTransitionExample() {
  return (
    <FlavorDataProvider>
      <Example header="startTransition example">
        <StartTransitionApp />
      </Example>
    </FlavorDataProvider>
  );
}
