import { InputHTMLAttributes, ReactNode, forwardRef } from "react";

interface CheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: ReactNode;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, className = "", id, ...props }, ref) => (
    <label
      htmlFor={id}
      className="inline-flex items-center gap-2 text-sm text-zinc-700 cursor-pointer select-none"
    >
      <input
        ref={ref}
        id={id}
        type="checkbox"
        className={`rounded border-zinc-300 accent-zinc-900 cursor-pointer ${className}`}
        {...props}
      />
      {label}
    </label>
  ),
);
Checkbox.displayName = "Checkbox";
