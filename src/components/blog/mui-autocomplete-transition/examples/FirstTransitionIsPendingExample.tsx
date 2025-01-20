import ConsoleLogProvider from "../ConsoleLogProvider";
import Example from "../Example";
import FlavorDataProvider from "../FlavorDataProvider";
import StartTransitionApp from "../apps/StartTransitionApp";

export default function FirstTransitionIsPendingExample() {
  return (
    <FlavorDataProvider>
      <ConsoleLogProvider>
        <Example header="First Transition Shows Content rendered with `isPending=true`...">
          <StartTransitionApp showLoadingText />
        </Example>
      </ConsoleLogProvider>
    </FlavorDataProvider>
  );
}
