import * as Primitive from "@radix-ui/react-select";
import { Check, ChevronDown, ChevronUp } from "lucide-react";
import { forwardRef, useId, useRef, useState } from "react";
const EMPTY = "__forme_empty__";
export const FormeSelect = forwardRef(function FormeSelect(
  {
    value,
    onValueChange,
    options,
    label,
    id,
    name,
    disabled,
    required,
    placeholder = "Choose an option",
    className = "",
    error,
    compact = false,
  },
  ref,
) {
  const generated = useId(),
    inputId = id || generated;
  const trigger = useRef(null);
  const [portalContainer, setPortalContainer] = useState(undefined);
  return (
    <div className={`forme-select ${compact ? "compact" : ""} ${className}`}>
      {label && (
        <label htmlFor={inputId}>
          {label}
          {required ? " *" : ""}
        </label>
      )}
      <Primitive.Root
        value={
          value === "" || value == null
            ? options.some((option) => option.value === "")
              ? EMPTY
              : ""
            : String(value)
        }
        onValueChange={(next) => onValueChange(next === EMPTY ? "" : next)}
        onOpenChange={(open) => {
          if (open)
            setPortalContainer(trigger.current?.closest("dialog") || undefined);
        }}
        name={name}
        disabled={disabled}
        required={required}
      >
        <Primitive.Trigger
          ref={(node) => {
            trigger.current = node;
            if (typeof ref === "function") ref(node);
            else if (ref) ref.current = node;
          }}
          id={inputId}
          className="forme-select-trigger"
          aria-label={label || placeholder}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : undefined}
        >
          <Primitive.Value placeholder={placeholder} />
          <Primitive.Icon>
            <ChevronDown size={15} />
          </Primitive.Icon>
        </Primitive.Trigger>
        <Primitive.Portal container={portalContainer}>
          <Primitive.Content
            position="popper"
            sideOffset={7}
            collisionPadding={12}
            className="forme-select-content"
          >
            <Primitive.ScrollUpButton className="select-scroll">
              <ChevronUp size={15} />
            </Primitive.ScrollUpButton>
            <Primitive.Viewport>
              {options.map((option) => (
                <Primitive.Item
                  className="forme-select-item"
                  key={option.value}
                  value={option.value === "" ? EMPTY : String(option.value)}
                  disabled={option.disabled}
                >
                  <Primitive.ItemText>{option.label}</Primitive.ItemText>
                  <Primitive.ItemIndicator>
                    <Check size={15} />
                  </Primitive.ItemIndicator>
                </Primitive.Item>
              ))}
            </Primitive.Viewport>
            <Primitive.ScrollDownButton className="select-scroll">
              <ChevronDown size={15} />
            </Primitive.ScrollDownButton>
          </Primitive.Content>
        </Primitive.Portal>
      </Primitive.Root>
      {error && (
        <p id={`${inputId}-error`} className="field-error">
          {error}
        </p>
      )}
    </div>
  );
});
