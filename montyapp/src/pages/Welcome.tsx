import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { ArrowRight, Loader2, UserRound } from "lucide-react";
import { AuthShell } from "@/components/auth/AuthShell";
import { AuthField } from "@/components/auth/AuthField";
import { authErrorMessage, completeWelcome, getSessionUser, goToApp } from "@/lib/auth";

interface WelcomeValues {
  fullName: string;
}

/**
 * The step a Google account sees once, on the sign-in that created it.
 *
 * Signing in with Google skips /signup entirely, so the one thing that form
 * collects and Google cannot be trusted to get right — the name this person
 * wants to be called — has never been confirmed. Everything else Google already
 * answered, which is why this asks for so little.
 *
 * It does not touch `user_usage.onboarding_completed`; the product app runs its
 * own questionnaire off that column and would skip it if this claimed it.
 */
const Welcome = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<WelcomeValues>({ defaultValues: { fullName: "" } });

  // Reached without a session — a bookmark, or a stale tab. There is no account
  // to name, so send them where they can make one.
  useEffect(() => {
    let active = true;

    (async () => {
      const user = await getSessionUser();
      if (!active) return;

      if (!user) {
        navigate("/login", { replace: true });
        return;
      }

      setEmail(user.email ?? null);
      reset({ fullName: (user.user_metadata?.full_name as string) ?? "" });
      setChecked(true);
    })();

    return () => {
      active = false;
    };
  }, [navigate, reset]);

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      await completeWelcome(values.fullName.trim());
      goToApp();
    } catch (error) {
      setFormError(authErrorMessage(error));
    }
  });

  if (!checked) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-6">
        <Loader2 className="h-4 w-4 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <AuthShell
      eyebrow="One last thing"
      title={
        <>
          Welcome to{" "}
          <span className="font-script text-accent text-[1.15em]">CitePark.</span>
        </>
      }
      intro="Your account is ready. Check we have your name right and we'll take you through to the app."
      footer={
        <>
          Rather sort this out later?{" "}
          <button
            type="button"
            onClick={goToApp}
            className="font-semibold text-primary underline decoration-accent decoration-2 underline-offset-4 hover:text-accent"
          >
            Skip to the app
          </button>
        </>
      }
    >
      <form onSubmit={onSubmit} noValidate className="space-y-5">
        {email && (
          <div className="flex items-center gap-3 rounded-lg border border-border bg-paper px-4 py-3">
            <UserRound className="h-4 w-4 shrink-0 text-accent" aria-hidden />
            <span className="truncate text-sm text-primary">{email}</span>
          </div>
        )}

        <AuthField
          label="Full name"
          placeholder="Ada Lovelace"
          autoComplete="name"
          autoFocus
          disabled={isSubmitting}
          error={errors.fullName?.message}
          hint="This is the name that appears on your work."
          {...register("fullName", {
            required: "Please enter your name.",
            minLength: { value: 2, message: "Please enter your name." },
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
              Continue to CitePark
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </form>
    </AuthShell>
  );
};

export default Welcome;
