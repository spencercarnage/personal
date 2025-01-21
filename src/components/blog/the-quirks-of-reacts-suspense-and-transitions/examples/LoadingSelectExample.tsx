import Example from "../Example";
import FlavorDataProvider from "../FlavorDataProvider";
import LoadingSelectApp from "../apps/LoadingSelectApp";

export default function LoadingSelectExample() {
  return (
    <FlavorDataProvider>
      <Example header="<FlavorSelect isLoading> example">
        <LoadingSelectApp />
      </Example>
    </FlavorDataProvider>
  );
}
