import Select from "react-select";

export default function LoadingSelectApp() {
  return (
    <label>
      Flavor
      <Select placeholder="Select a flavor" isLoading />
    </label>
  );
}
