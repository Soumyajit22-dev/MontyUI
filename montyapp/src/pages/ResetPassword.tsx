import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { ArrowRight, CheckCircle2, Loader2 } from "lucide-react";
import { AuthShell } from "@/components/auth/AuthShell";
import { AuthField } from "@/components/auth/AuthField";
import {
  authErrorMessage,
  consumeRecoveryLink,
  goToApp,
  updatePassword,
} from "@/lib/auth";

interface ResetPasswordValues {
  password: string;
  confirmPassword: string;
}

/** "checking" covers the moment the link in the URL is being redeemed. */
type Stage = "checking" | "ready" | "invalid" | "done";

const ResetPassword = () => {
  const [stage, setStage] = useState<Stage>("checking");
  const [linkError, setLinkError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  // One redemption per visit: a PKCE code is single-use, and StrictMode runs
  // effects twice in development.
  const redeemed = useRef(false);

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordValues>({
    defaultValues: { password: "", confirmPassword: "" },
  });

  useEffect(() => {
    if (redeemed.current) return;
    redeemed.current = true;

    let active = true;

    (async () => {
      try {
        const outcome = await consumeRecoveryLink();
        if (!active) return;

        if (outcome === "no-link") {
          setLinkError("Open the link from your password reset email to continue.");
          setStage("invalid");
          return;
        }
        setStage("ready");
      } catch (error) {
        if (!active) return;
        setLinkError(authErrorMessage(error));
        setStage("invalid");
      } finally {
        // Keep the recovery credentials out of the address bar, history entry
        // and any Referer this page goes on to send.
        if (window.location.hash || window.location.search) {
          window.history.replaceState(null, "", window.location.pathname);
        }
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      await updatePassword(values.password);
      setStage("done");
    } catch (error) {
      setFormError(authErrorMessage(error));
    }
  });

  if (stage === "checking") {
    return (
      <AuthShell
        eyebrow="Password reset"
        title="One moment."
        intro="Checking your reset link."
        footer={<>&nbsp;</>}
      >
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin text-accent" />
          Verifying…
        </div>
      </AuthShell>
    );
  }

  if (stage === "invalid") {
    return (
      <AuthShell
        eyebrow="Password reset"
        title="This link won't work."
        intro={linkError ?? "That reset link is no longer valid."}
        footer={
          <>
            Know your password?{" "}
            <Link
              to="/login"
              className="font-semibold text-primary underline decoration-accent decoration-2 underline-offset-4 hover:text-accent"
            >
              Sign in
            </Link>
          </>
        }
      >
        <Link
          to="/forgot-password"
          className="flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-accent"
        >
          Request a new link
          <ArrowRight className="h-4 w-4" />
        </Link>
      </AuthShell>
    );
  }

  if (stage === "done") {
    return (
      <AuthShell
        eyebrow="All set"
        title="Your password is updated."
        intro="Use it the next time you sign in — here or in the CitePark app."
        footer={
          <>
            Or head{" "}
            <Link
              to="/login"
              className="font-semibold text-primary underline decoration-accent decoration-2 underline-offset-4 hover:text-accent"
            >
              back to sign in
            </Link>
          </>
        }
      >
        <div className="mb-6 flex items-start gap-4 rounded-2xl bg-paper p-6 shadow-soft">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
          <p className="text-sm leading-relaxed text-muted-foreground">
            Any other device signed in to this account keeps its session. Sign out from
            there if you were resetting because someone else had your password.
          </p>
        </div>

        <button
          type="button"
          onClick={goToApp}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-accent"
        >
          Continue to CitePark
          <ArrowRight className="h-4 w-4" />
        </button>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      eyebrow="Password reset"
      title={
        <>
          Choose something{" "}
          <span className="font-script text-accent text-[1.15em]">new.</span>
        </>
      }
      intro="Pick a password you don't use anywhere else. You'll be signed in once it's saved."
      footer={
        <>
          Changed your mind?{" "}
          <Link
            to="/login"
            className="font-semibold text-primary underline decoration-accent decoration-2 underline-offset-4 hover:text-accent"
          >
            Back to sign in
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} noValidate className="space-y-5">
        <AuthField
          label="New password"
          type="password"
          placeholder="At least 8 characters"
          autoComplete="new-password"
          autoFocus
          disabled={isSubmitting}
          error={errors.password?.message}
          hint="Use at least 8 characters."
          {...register("password", {
            required: "Please choose a password.",
            minLength: { value: 8, message: "Use at least 8 characters." },
          })}
        />

        <AuthField
          label="Confirm new password"
          type="password"
          placeholder="Repeat your password"
          autoComplete="new-password"
          disabled={isSubmitting}
          error={errors.confirmPassword?.message}
          {...register("confirmPassword", {
            required: "Please confirm your password.",
            validate: (value) =>
              value === getValues("password") || "Those passwords don't match.",
          })}
        />

        {formError && (
          <p role="alert" className="text-sm text-destructive">
            {formError}
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
              Saving…
            </>
          ) : (
            <>
              Save new password
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </form>
    </AuthShell>
  );
};

export default ResetPassword;
