import ConsoleLogProvider from "../ConsoleLogProvider";
import Example from "../Example";
import FlavorDataProvider from "../FlavorDataProvider";
import IsPendingNullApp from "../apps/IsPendingNullApp";

export default function IsPendingNullExample() {
  return (
    <FlavorDataProvider>
      <ConsoleLogProvider>
        <Example header="IsPendingNull">
          <IsPendingNullApp showLoadingText />
        </Example>
      </ConsoleLogProvider>
    </FlavorDataProvider>
  );
}
