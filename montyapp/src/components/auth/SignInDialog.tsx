import { Link, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { ArrowRight, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AuthField } from "@/components/auth/AuthField";
import { AuthDivider, GoogleButton } from "@/components/auth/GoogleButton";
import { authErrorMessage, signInWithPassword } from "@/lib/auth";

interface SignInValues {
  email: string;
  password: string;
}

interface SignInDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Runs once a session exists, with the dialog already closed. */
  onContinue: () => void;
  /** Completes "Sign in to …". */
  purpose: string;
}

/**
 * The account gate in front of anything that has to be bought by somebody.
 *
 * Only an unrecognised visitor sees it: a purchase has to land on an account,
 * and someone already signed in has one — callers check that first and go
 * straight to the payment rather than asking for credentials a second time.
 * Signing in here rather than at /login keeps them on the page they were
 * buying from.
 */
export function SignInDialog({ open, onOpenChange, onContinue, purpose }: SignInDialogProps) {
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
    if (!next) reset();
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

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl font-semibold tracking-[-0.02em] text-primary">
            {`Sign in to ${purpose}`}
          </DialogTitle>
          <DialogDescription className="text-sm leading-relaxed text-muted-foreground">
            {`Your payment is tied to a CitePark account, so we need to know which one to ${purpose}.`}
          </DialogDescription>
        </DialogHeader>

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
      </DialogContent>
    </Dialog>
  );
}
