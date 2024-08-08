import DessertAutocomplete from "./DessertAutocomplete";

export default function Example1() {
  return (
    <div id="Example1">
      <div
        style={{
          color: "black",
          display: "grid",
          gap: "8px",
          background: "white",
          padding: "24px",
        }}
      >
        <DessertAutocomplete />
      </div>
    </div>
  );
}
