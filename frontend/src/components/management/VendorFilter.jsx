import { FormeSelect } from "../forme/Select";
export function VendorFilter({ value, onChange, vendors }) {
  return (
    <FormeSelect
      label="Vendor"
      value={value}
      onValueChange={onChange}
      options={[
        { value: "", label: "All vendors" },
        ...vendors.map((v) => ({
          value: String(v.id),
          label: `${v.name} · #${v.id}`,
        })),
      ]}
    />
  );
}
