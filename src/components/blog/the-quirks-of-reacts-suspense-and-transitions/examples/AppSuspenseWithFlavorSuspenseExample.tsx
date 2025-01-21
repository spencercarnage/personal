import React from "react";
import Example from "../Example";
import FlavorDataProvider from "../FlavorDataProvider";
import AppSuspenseWithFlavorSuspenseApp from "../apps/AppSuspenseWithFlavorSuspenseApp";

export default function AppSuspenseWithFlavorSuspenseExample() {
  return (
    <FlavorDataProvider>
      <Example header="App Suspense and Flavor Suspense">
        <AppSuspenseWithFlavorSuspenseApp />
      </Example>
    </FlavorDataProvider>
  );
}
