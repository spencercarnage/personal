import React from "react";
import Example from "../Example";
import FlavorDataProvider from "../FlavorDataProvider";
import NoUnmountEffectApp from "../apps/NoUnmountEffectApp";

export default function NoUnmountEffectExample() {
  return (
    <FlavorDataProvider>
      <Example header="No Unmount Effect example">
        <NoUnmountEffectApp />
      </Example>
    </FlavorDataProvider>
  );
}
