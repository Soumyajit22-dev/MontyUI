import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { ArrowRight, Loader2, UserRound } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AuthField } from "@/components/auth/AuthField";
import { AuthDivider, GoogleButton } from "@/components/auth/GoogleButton";
import { authErrorMessage, signInWithPassword, signOut } from "@/lib/auth";

interface SignInValues {
  email: string;
  password: string;
}

interface SignInDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Runs once a session exists, with the dialog already closed. */
  onContinue: () => void;
  /** Email of the account already signed in here, if any. */
  signedInAs?: string | null;
  /** Completes "Sign in to …" and "… will be added to this account". */
  purpose: string;
}

/**
 * The account gate in front of anything that has to be bought by somebody.
 *
 * It always appears, even for a visitor who is already signed in — a charge
 * lands on one specific account, and a stale session from a shared browser is
 * exactly the case where being shown which one matters. Signing in here rather
 * than at /login keeps them on the page they were buying from.
 */
export function SignInDialog({
  open,
  onOpenChange,
  onContinue,
  signedInAs,
  purpose,
}: SignInDialogProps) {
  // Set when someone signed in here wants to pay as a different account.
  const [switching, setSwitching] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  // Google's hand-off is a full page load, so it cannot resolve back into this
  // dialog. Bring them back to the page they were buying from instead — the
  // gate reopens on the next click, now showing the account they just chose.
  const { pathname, search } = useLocation();

  const {
    register,
    handleSubmit,
    reset,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<SignInValues>({ defaultValues: { email: "", password: "" } });

  // A dialog that reopens should not still be showing the last attempt's state.
  const handleOpenChange = (next: boolean) => {
    if (!next) {
      reset();
      setSwitching(false);
    }
    onOpenChange(next);
  };

  const proceed = () => {
    handleOpenChange(false);
    onContinue();
  };

  const onSubmit = handleSubmit(async (values) => {
    clearErrors("root");
    try {
      await signInWithPassword(values.email.trim(), values.password);
      proceed();
    } catch (error) {
      setError("root", { message: authErrorMessage(error) });
    }
  });

  const useAnotherAccount = async () => {
    setSigningOut(true);
    try {
      await signOut();
      setSwitching(true);
    } finally {
      setSigningOut(false);
    }
  };

  const confirming = Boolean(signedInAs) && !switching;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl font-semibold tracking-[-0.02em] text-primary">
            {confirming ? "Confirm your account" : `Sign in to ${purpose}`}
          </DialogTitle>
          <DialogDescription className="text-sm leading-relaxed text-muted-foreground">
            {confirming
              ? `${purpose[0].toUpperCase()}${purpose.slice(1)} applies to the account you pay from — check this is the right one.`
              : `Your payment is tied to a CitePark account, so we need to know which one to ${purpose}.`}
          </DialogDescription>
        </DialogHeader>

        {confirming ? (
          <div className="mt-2 space-y-5">
            <div className="flex items-center gap-3 rounded-lg border border-border bg-paper px-4 py-3">
              <UserRound className="h-4 w-4 shrink-0 text-accent" aria-hidden />
              <span className="truncate text-sm text-primary">{signedInAs}</span>
            </div>

            <button
              type="button"
              onClick={proceed}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-accent"
            >
              Continue to payment
              <ArrowRight className="h-4 w-4" />
            </button>

            <p className="text-center text-sm text-muted-foreground">
              <button
                type="button"
                onClick={useAnotherAccount}
                disabled={signingOut}
                className="font-semibold text-primary underline decoration-accent decoration-2 underline-offset-4 transition-colors hover:text-accent disabled:opacity-60"
              >
                {signingOut ? "Signing out…" : "Use a different account"}
              </button>
            </p>
          </div>
        ) : (
          <div className="mt-2 space-y-5">
            <GoogleButton next={`${pathname}${search}`} disabled={isSubmitting} />
            <AuthDivider />

            <form onSubmit={onSubmit} noValidate className="space-y-5">
              <AuthField
                label="Email"
                type="email"
                placeholder="you@university.edu"
                autoComplete="email"
                autoFocus
                disabled={isSubmitting}
                error={errors.email?.message}
                {...register("email", {
                  required: "Please enter your email.",
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: "That doesn't look like a valid email.",
                  },
                })}
              />

              <AuthField
                label="Password"
                type="password"
                placeholder="Your password"
                autoComplete="current-password"
                disabled={isSubmitting}
                error={errors.password?.message}
                {...register("password", { required: "Please enter your password." })}
              />

              {errors.root && (
                <p role="alert" className="text-sm text-destructive">
                  {errors.root.message}
                </p>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Signing in…
                  </>
                ) : (
                  <>
                    Sign in and continue
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>

              <p className="text-center text-sm text-muted-foreground">
                No account yet?{" "}
                <Link
                  to="/signup"
                  className="font-semibold text-primary underline decoration-accent decoration-2 underline-offset-4 hover:text-accent"
                >
                  Create one
                </Link>
              </p>
            </form>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
