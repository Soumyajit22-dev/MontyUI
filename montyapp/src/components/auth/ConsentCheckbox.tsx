import { forwardRef, useId, type InputHTMLAttributes } from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface ConsentCheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

/**
 * The agreement to the Terms and the Privacy Policy, as a tick the visitor has
 * to make themselves.
 *
 * A native checkbox rather than the Radix one in components/ui: react-hook-form
 * registers this by ref, and Radix's is a controlled button that would need a
 * Controller wrapper to say the same thing. `accent-accent` gives the tick the
 * ember of the rest of the site without rebuilding the control.
 *
 * ## The links inside the label
 *
 * Clicking "Privacy Policy" must open the policy and nothing else. Left alone
 * it does both — the click bubbles to the surrounding <label>, whose activation
 * behaviour toggles the box, so a visitor who goes off to read the terms comes
 * back to find they have already agreed to them. Stopping propagation at the
 * link takes the label out of the event's path, which is what suppresses that.
 *
 * The text is still a label, and still toggles the box when clicked anywhere
 * else — the hit target matters more than the edge case it costs.
 */
export const ConsentCheckbox = forwardRef<HTMLInputElement, ConsentCheckboxProps>(
  ({ error, className, ...props }, ref) => {
    const id = useId();
    const errorId = `${id}-error`;
    const stopLabelToggle = (event: { stopPropagation: () => void }) => event.stopPropagation();

    return (
      <div>
        <div className="flex items-start gap-3">
          <input
            {...props}
            id={id}
            ref={ref}
            type="checkbox"
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? errorId : undefined}
            className={cn(
              "mt-0.5 h-4 w-4 shrink-0 cursor-pointer rounded border accent-accent",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2",
              "disabled:cursor-not-allowed disabled:opacity-60",
              error ? "border-destructive" : "border-border",
              className
            )}
          />

          <label htmlFor={id} className="cursor-pointer text-xs leading-relaxed text-muted-foreground">
            I agree to CitePark's{" "}
            <Link
              to="/terms"
              onClick={stopLabelToggle}
              className="font-medium text-accent underline underline-offset-4"
            >
              Terms &amp; Conditions
            </Link>{" "}
            and{" "}
            <Link
              to="/privacy"
              onClick={stopLabelToggle}
              className="font-medium text-accent underline underline-offset-4"
            >
              Privacy Policy
            </Link>
            .
          </label>
        </div>

        {error && (
          <p id={errorId} role="alert" className="mt-2 text-xs text-destructive">
            {error}
          </p>
        )}
      </div>
    );
  }
);

ConsentCheckbox.displayName = "ConsentCheckbox";
