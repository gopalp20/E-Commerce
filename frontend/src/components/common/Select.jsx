import { Children, forwardRef } from "react";
import { FormeSelect } from "../forme/Select";
export const Select = forwardRef(function Select(
  { options = [], children, onChange, value, helper, ...props },
  ref,
) {
  const choices = children
    ? Children.toArray(children).map((child) => ({
        value: child.props.value,
        label: child.props.children,
        disabled: child.props.disabled,
      }))
    : options;
  return (
    <div className="w-full">
      <FormeSelect
        {...props}
        ref={ref}
        value={value}
        options={choices}
        onValueChange={(next) =>
          onChange?.({ target: { value: next, name: props.name } })
        }
      />
      {helper && <p className="field-help">{helper}</p>}
    </div>
  );
});
