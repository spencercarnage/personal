import React from "react";
import Example from "../Example";
import FlavorDataProvider from "../FlavorDataProvider";
import SuspenseWithUseApp from "../apps/SuspenseWithUseApp";

export default function SuspenseWithUseExample() {
  return (
    <FlavorDataProvider>
      <Example header='Suspense with "use"'>
        <SuspenseWithUseApp />
      </Example>
    </FlavorDataProvider>
  );
}
