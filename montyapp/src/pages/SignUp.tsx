import { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { ArrowRight, Loader2, MailCheck } from "lucide-react";
import { AuthShell } from "@/components/auth/AuthShell";
import { AuthField } from "@/components/auth/AuthField";
import { AuthDivider, GoogleButton } from "@/components/auth/GoogleButton";
import { APP_URL } from "@/lib/supabase";
import { authErrorMessage, goToApp, signUpWithPassword } from "@/lib/auth";

interface SignUpValues {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const SignUp = () => {
  const [formError, setFormError] = useState<string | null>(null);
  const [sentTo, setSentTo] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<SignUpValues>({
    defaultValues: { fullName: "", email: "", password: "", confirmPassword: "" },
  });

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      const outcome = await signUpWithPassword(
        values.email.trim(),
        values.password,
        values.fullName.trim()
      );

      if (outcome === "active") {
        goToApp();
        return;
      }
      setSentTo(values.email.trim());
    } catch (error) {
      setFormError(authErrorMessage(error));
    }
  });

  // Email confirmation is on for this project — the account exists but is not usable yet.
  if (sentTo) {
    return (
      <AuthShell
        eyebrow="Almost there"
        title="Check your inbox."
        intro={`We sent a confirmation link to ${sentTo}. Open it to activate your account — the link takes you straight to the CitePark app.`}
        footer={
          <>
            Wrong address?{" "}
            <button
              type="button"
              onClick={() => setSentTo(null)}
              className="font-semibold text-primary underline decoration-accent decoration-2 underline-offset-4 hover:text-accent"
            >
              Start over
            </button>
          </>
        }
      >
        <div className="flex items-start gap-4 rounded-2xl bg-paper p-6 shadow-soft">
          <MailCheck className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
          <p className="text-sm leading-relaxed text-muted-foreground">
            Once confirmed, sign in at{" "}
            <a
              href={APP_URL}
              className="font-medium text-primary underline decoration-accent decoration-2 underline-offset-4 hover:text-accent"
            >
              {APP_URL.replace(/^https?:\/\//, "")}
            </a>{" "}
            with the email and password you just chose.
          </p>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      eyebrow="Create your account"
      title={
        <>
          Start writing with{" "}
          <span className="font-script text-accent text-[1.15em]">everything cited.</span>
        </>
      }
      intro="One account works across citepark.com and the CitePark app. It takes about a minute."
      footer={
        <>
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-semibold text-primary underline decoration-accent decoration-2 underline-offset-4 hover:text-accent"
          >
            Sign in
          </Link>
        </>
      }
    >
      {/* Google verifies the address itself, so this route skips the
          confirmation email the form below has to send. */}
      <div className="space-y-6">
        <GoogleButton label="Sign up with Google" disabled={isSubmitting} />
        <AuthDivider />
      </div>

      <form onSubmit={onSubmit} noValidate className="mt-6 space-y-5">
        <AuthField
          label="Full name"
          placeholder="Ada Lovelace"
          autoComplete="name"
          disabled={isSubmitting}
          error={errors.fullName?.message}
          {...register("fullName", {
            required: "Please enter your name.",
            minLength: { value: 2, message: "Please enter your name." },
          })}
        />

        <AuthField
          label="Email"
          type="email"
          placeholder="you@university.edu"
          autoComplete="email"
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
          placeholder="At least 8 characters"
          autoComplete="new-password"
          disabled={isSubmitting}
          error={errors.password?.message}
          hint="Use at least 8 characters."
          {...register("password", {
            required: "Please choose a password.",
            minLength: { value: 8, message: "Use at least 8 characters." },
          })}
        />

        <AuthField
          label="Confirm password"
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
              Creating account…
            </>
          ) : (
            <>
              Create account
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </form>
    </AuthShell>
  );
};

export default SignUp;
