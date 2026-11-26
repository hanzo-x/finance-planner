import * as React from "react";
import { Label } from "@/components/ui/label";

export function fieldProps(name: string, errors?: string[]) {
  const hasError = Boolean(errors?.length);
  return {
    id: name,
    name,
    "aria-invalid": hasError || undefined,
    "aria-describedby": hasError ? `${name}-error` : undefined,
  };
}

export function FieldError({ name, errors }: { name: string; errors?: string[] }) {
  if (!errors?.length) return null;
  return (
    <p id={`${name}-error`} role="alert" className="text-sm text-destructive">
      {errors[0]}
    </p>
  );
}

export function Field({
  name,
  label,
  errors,
  hint,
  children,
}: {
  name: string;
  label: string;
  errors?: string[];
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={name}>{label}</Label>
      {children}
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
      <FieldError name={name} errors={errors} />
    </div>
  );
}
