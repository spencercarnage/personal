import Example from "../Example";
import FlavorDataProvider from "../FlavorDataProvider";
import IsPendingConsoleApp from "../apps/IsPendingConsoleApp";

export default function IsPendingConsoleExample() {
  return (
    <FlavorDataProvider>
      <Example header="isPending Console Log">
        <IsPendingConsoleApp />
      </Example>
    </FlavorDataProvider>
  );
}
