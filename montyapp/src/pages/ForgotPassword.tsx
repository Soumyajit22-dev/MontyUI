import { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { ArrowRight, Loader2, MailCheck } from "lucide-react";
import { AuthShell } from "@/components/auth/AuthShell";
import { AuthField } from "@/components/auth/AuthField";
import { authErrorMessage, requestPasswordReset } from "@/lib/auth";

interface ForgotPasswordValues {
  email: string;
}

const ForgotPassword = () => {
  const [formError, setFormError] = useState<string | null>(null);
  const [sentTo, setSentTo] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordValues>({ defaultValues: { email: "" } });

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    const email = values.email.trim();
    try {
      await requestPasswordReset(email);
      // Shown for any address, known or not — telling the two apart here would
      // let anyone check who has an account.
      setSentTo(email);
    } catch (error) {
      setFormError(authErrorMessage(error));
    }
  });

  if (sentTo) {
    return (
      <AuthShell
        eyebrow="Check your inbox"
        title="The link is on its way."
        intro={`If ${sentTo} has a CitePark account, we've sent it a link for choosing a new password. It's good for one hour.`}
        footer={
          <>
            Remembered it after all?{" "}
            <Link
              to="/login"
              className="font-semibold text-primary underline decoration-accent decoration-2 underline-offset-4 hover:text-accent"
            >
              Back to sign in
            </Link>
          </>
        }
      >
        <div className="flex items-start gap-4 rounded-2xl bg-paper p-6 shadow-soft">
          <MailCheck className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
          <p className="text-sm leading-relaxed text-muted-foreground">
            Nothing after a minute or two? Check your spam folder, then{" "}
            <button
              type="button"
              onClick={() => setSentTo(null)}
              className="font-medium text-primary underline decoration-accent decoration-2 underline-offset-4 hover:text-accent"
            >
              try another address
            </button>
            .
          </p>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      eyebrow="Password reset"
      title={
        <>
          Let's get you back{" "}
          <span className="font-script text-accent text-[1.15em]">in.</span>
        </>
      }
      intro="Enter the email you signed up with and we'll send you a link to choose a new password."
      footer={
        <>
          Remembered it after all?{" "}
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
              Sending link…
            </>
          ) : (
            <>
              Send reset link
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </form>
    </AuthShell>
  );
};

export default ForgotPassword;
