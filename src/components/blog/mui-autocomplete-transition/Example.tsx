import { type ReactNode, useEffect, useState } from "react";
import { useFlavorData } from "./FlavorDataProvider";

function randomStr() {
  return (Math.random() + 1).toString(36).substring(7);
}

export type ExampleProps = {
  children: ReactNode;
  header: string;
  num?: number | string;
  reset?: string;
  onReset?: () => void;
};

export default function Example({
  children,
  header,
  num = "Example",
  reset = "reset",
  onReset,
}: ExampleProps) {
  const [exampleId, setExampleId] = useState(randomStr());
  const { clearCache } = useFlavorData();

  useEffect(() => {
    return () => {
      onReset?.();
      clearCache();
    };
  }, [clearCache, onReset]);

  return (
    <div
      key={exampleId}
      style={{
        color: "black",
        display: "grid",
        gap: "8px",
        background: "white",
        padding: "24px",
      }}
    >
      <div style={{ fontSize: "12px" }}>
        {header || num}
        <button
          type="button"
          onClick={() => {
            setExampleId(randomStr());
            clearCache();
          }}
        >
          {reset}
        </button>
      </div>
      {children}
    </div>
  );
}
