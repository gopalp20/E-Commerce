import { Plus, Trash2 } from "lucide-react";
import { Field } from "../forme/UI";

export function ProductDetailsEditor({ value, onChange }) {
  const update = (index, key, text) =>
    onChange(
      value.map((item, i) => (i === index ? { ...item, [key]: text } : item)),
    );
  return (
    <div className="work-specifications-editor">
      <p className="work-form-help">
        Help customers choose with specific details: materials, dimensions,
        care, warranty or what’s included.
      </p>
      {value.map((item, index) => (
        <div className="work-specification-row" key={index}>
          <Field
            id={`detail-label-${index}`}
            label={`Detail ${index + 1}`}
            value={item.label}
            maxLength={60}
            required
            placeholder="e.g. Material"
            onChange={(event) => update(index, "label", event.target.value)}
          />
          <Field
            id={`detail-value-${index}`}
            label="Value"
            value={item.value}
            maxLength={500}
            required
            placeholder="e.g. Solid oak"
            onChange={(event) => update(index, "value", event.target.value)}
          />
          <button
            type="button"
            className="work-icon-button"
            aria-label={`Remove detail ${index + 1}`}
            onClick={() => onChange(value.filter((_, i) => i !== index))}
          >
            <Trash2 size={17} />
          </button>
        </div>
      ))}
      <button
        type="button"
        className="work-button secondary"
        disabled={value.length >= 12}
        onClick={() => onChange([...value, { label: "", value: "" }])}
      >
        <Plus size={16} />
        Add a detail
      </button>
    </div>
  );
}
