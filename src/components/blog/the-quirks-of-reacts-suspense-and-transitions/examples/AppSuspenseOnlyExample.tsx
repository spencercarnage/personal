import React from "react";
import Example from "../Example";
import FlavorDataProvider from "../FlavorDataProvider";
import AppSuspenseOnlyApp from "../apps/AppSuspenseOnlyApp";

export default function AppSuspenseOnlyExample() {
  return (
    <FlavorDataProvider>
      <Example header="App Suspense only">
        <AppSuspenseOnlyApp />
      </Example>
    </FlavorDataProvider>
  );
}
