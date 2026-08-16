import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  ANNUAL_SAVING_PERCENT,
  type BillingPeriod,
  isBillingPeriod,
} from "@/lib/plans";

interface BillingToggleProps {
  value: BillingPeriod;
  onChange: (period: BillingPeriod) => void;
  className?: string;
}

/**
 * Monthly or annual, for the plan cards.
 *
 * Built on ToggleGroup rather than two buttons so the pair behaves like one
 * control: arrow keys move between the options and only the selected one is a
 * tab stop. Its default variant is styled for toolbars, so everything visible
 * here is overridden onto the house pill — the same shape and lettering as the
 * CTAs the cards below it carry.
 */
export function BillingToggle({ value, onChange, className = "" }: BillingToggleProps) {
  return (
    <div className={`flex ${className}`}>
      <ToggleGroup
        type="single"
        value={value}
        // Radix reports deselecting the active item as "", which would leave the
        // cards with no price to show. A billing period is always chosen.
        onValueChange={(next) => {
          if (isBillingPeriod(next)) onChange(next);
        }}
        aria-label="Billing period"
        className="gap-1 rounded-full border border-border bg-paper p-1"
      >
        <ToggleGroupItem
          value="monthly"
          aria-label="Pay monthly"
          className="rounded-full px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground transition-colors data-[state=on]:bg-primary data-[state=on]:text-primary-foreground hover:bg-transparent hover:text-primary"
        >
          Monthly
        </ToggleGroupItem>

        <ToggleGroupItem
          value="annual"
          aria-label={`Pay annually and save ${ANNUAL_SAVING_PERCENT} percent`}
          className="gap-2 rounded-full px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground transition-colors data-[state=on]:bg-primary data-[state=on]:text-primary-foreground hover:bg-transparent hover:text-primary"
        >
          Annual
          <span
            aria-hidden
            className="rounded-full bg-accent px-2 py-0.5 text-[0.6rem] font-semibold tracking-[0.08em] text-accent-foreground"
          >
            −{ANNUAL_SAVING_PERCENT}%
          </span>
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  );
}
