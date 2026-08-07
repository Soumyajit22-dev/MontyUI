import { forwardRef, useId, useState, type InputHTMLAttributes } from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface AuthFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string;
}

export const AuthField = forwardRef<HTMLInputElement, AuthFieldProps>(
  ({ label, error, hint, className, type = "text", ...props }, ref) => {
    const id = useId();
    const hintId = `${id}-hint`;
    const [revealed, setRevealed] = useState(false);
    const isPassword = type === "password";

    return (
      <div>
        <label htmlFor={id} className="label-eyebrow text-forest-soft">
          {label}
        </label>

        <div className="relative">
          <input
            {...props}
            id={id}
            ref={ref}
            type={isPassword && revealed ? "text" : type}
            aria-invalid={error ? true : undefined}
            aria-describedby={error || hint ? hintId : undefined}
            className={cn(
              "mt-2 w-full rounded-lg border bg-paper px-4 py-3 text-sm text-primary outline-none transition-colors",
              "placeholder:text-muted-foreground/60 focus:border-accent",
              "disabled:cursor-not-allowed disabled:opacity-60",
              isPassword && "pr-12",
              error ? "border-destructive" : "border-border",
              className
            )}
          />

          {isPassword && (
            <button
              type="button"
              onClick={() => setRevealed((v) => !v)}
              aria-label={revealed ? "Hide password" : "Show password"}
              className="absolute right-3 top-1/2 mt-1 -translate-y-1/2 p-1 text-muted-foreground transition-colors hover:text-primary"
            >
              {revealed ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          )}
        </div>

        {(error || hint) && (
          <p
            id={hintId}
            className={cn("mt-2 text-xs", error ? "text-destructive" : "text-muted-foreground")}
          >
            {error ?? hint}
          </p>
        )}
      </div>
    );
  }
);

AuthField.displayName = "AuthField";
