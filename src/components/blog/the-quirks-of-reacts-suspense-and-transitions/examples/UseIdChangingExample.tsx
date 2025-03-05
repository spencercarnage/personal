import Example from "../Example";
import FlavorDataProvider from "../FlavorDataProvider";
import UseIdChangingApp from "../apps/UseIdChangingApp";

export default function UseIdChangingExample() {
  return (
    <FlavorDataProvider>
      <Example header="useId Changing example">
        <UseIdChangingApp />
      </Example>
    </FlavorDataProvider>
  );
}
