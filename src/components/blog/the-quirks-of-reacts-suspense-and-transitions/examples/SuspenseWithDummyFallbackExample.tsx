import Example from "../Example";
import FlavorDataProvider from "../FlavorDataProvider";
import SuspenseWithDummyFallbackApp from "../apps/SuspenseWithDummyFallbackApp";

export default function SuspenseWithDummyFallbackExample() {
  return (
    <FlavorDataProvider>
      <Example header="<Suspense> With Dummy Fallback">
        <SuspenseWithDummyFallbackApp />
      </Example>
    </FlavorDataProvider>
  );
}
