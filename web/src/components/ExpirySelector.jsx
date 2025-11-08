const EXPIRY_OPTIONS = [
  { label: "No expiry", value: "" },
  { label: "10 minutes", value: 600000 }, // ms
  { label: "1 day", value: 86400000 },
  { label: "1 week", value: 604800000 },
  { label: "1 month", value: 2592000000 },
];

export default function ExpirySelector({ value, onChange, disabled }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-[--color-accent-blue] mb-2">
        Link Expiry
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value ? Number(e.target.value) : "")}
        disabled={disabled}
        className="input-base cursor-pointer"
      >
        {EXPIRY_OPTIONS.map((option) => (
          <option
            key={option.value || "none"}
            value={option.value}
            className="bg-[--color-bg-secondary] text-[--color-text-primary]"
          >
            {option.label}
          </option>
        ))}
      </select>
      {value && (
        <p className="text-xs text-[--color-text-secondary] mt-2">
          Link will expire in{" "}
          {EXPIRY_OPTIONS.find((o) => o.value === value)?.label.toLowerCase()}
        </p>
      )}
    </div>
  );
}
