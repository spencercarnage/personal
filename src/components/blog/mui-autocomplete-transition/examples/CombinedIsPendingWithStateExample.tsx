import ConsoleLogProvider from "../ConsoleLogProvider";
import Example from "../Example";
import FlavorDataProvider from "../FlavorDataProvider";
import CombinedIsPendingWithStateApp from "../apps/CombinedIsPendingWithStateApp";

export default function CombinedIsPendingWithStateExample() {
  return (
    <FlavorDataProvider>
      <ConsoleLogProvider>
        <Example header="Combine `isPending` with selected dessert...">
          <CombinedIsPendingWithStateApp showLoadingText />
        </Example>
      </ConsoleLogProvider>
    </FlavorDataProvider>
  );
}
