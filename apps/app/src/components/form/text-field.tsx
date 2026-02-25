import type { HTMLInputTypeAttribute } from "react";
import { Field, FieldError, FieldLabel } from "../ui/field";
import { Input } from "../ui/input";
import { useFieldContext } from "@/lib/form";

type Props = {
  label: string;
  placeholder?: string;
  autoComplete?: string;
  type?: HTMLInputTypeAttribute;
};

export default function TextField({
  label,
  placeholder,
  autoComplete = "off",
  type = "text",
}: Props) {
  const field = useFieldContext<string>();
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
  return (
    <Field data-invalid={isInvalid}>
      <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
      <Input
        id={field.name}
        name={field.name}
        type={type}
        placeholder={placeholder}
        autoComplete={autoComplete}
        value={field.state.value}
        onChange={(e) => field.handleChange(e.target.value)}
        onBlur={field.handleBlur}
        aria-invalid={isInvalid}
      />
      {isInvalid && <FieldError errors={field.state.meta.errors} />}
    </Field>
  );
}
