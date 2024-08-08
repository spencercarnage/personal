import type { ReactNode } from "react";

export default function Example({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        color: "black",
        display: "grid",
        gap: "8px",
        background: "white",
        padding: "24px",
      }}
    >
      {children}
    </div>
  );
}
