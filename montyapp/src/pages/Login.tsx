import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { ArrowRight, Loader2, UserRound } from "lucide-react";
import { AuthShell } from "@/components/auth/AuthShell";
import { AuthField } from "@/components/auth/AuthField";
import { AuthDivider, GoogleButton } from "@/components/auth/GoogleButton";
import {
  EXISTING_ACCOUNT_PARAM,
  authErrorMessage,
  goToApp,
  signInWithPassword,
} from "@/lib/auth";

interface LoginValues {
  email: string;
  password: string;
}

const Login = () => {
  const [formError, setFormError] = useState<string | null>(null);

  // Set when someone pressed "Sign up with Google" for an email that already
  // has an account. Google signed them in on the way here, so the session is
  // real — this explains the detour rather than asking them to prove anything.
  const [params] = useSearchParams();
  const alreadyRegistered = params.get(EXISTING_ACCOUNT_PARAM) === "1";

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({ defaultValues: { email: "", password: "" } });

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      await signInWithPassword(values.email.trim(), values.password);
      goToApp();
    } catch (error) {
      setFormError(authErrorMessage(error));
    }
  });

  return (
    <AuthShell
      eyebrow="Welcome back"
      title={
        <>
          Pick up where you{" "}
          <span className="font-script text-accent text-[1.15em]">left off.</span>
        </>
      }
      intro="Sign in with your CitePark account. We'll take you through to the app."
      footer={
        <>
          Don't have an account yet?{" "}
          <Link
            to="/signup"
            className="font-semibold text-primary underline decoration-accent decoration-2 underline-offset-4 hover:text-accent"
          >
            Create one
          </Link>
        </>
      }
    >
      {alreadyRegistered && (
        <div className="mb-6 rounded-2xl border border-border bg-paper p-5">
          <div className="flex items-start gap-3">
            <UserRound className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden />
            <div className="space-y-3">
              <p className="text-sm leading-relaxed text-primary">
                That Google account already belongs to a CitePark account, so there was
                nothing to create — we've signed you in instead.
              </p>
              <button
                type="button"
                onClick={goToApp}
                className="inline-flex items-center gap-2 text-sm font-semibold text-primary underline decoration-accent decoration-2 underline-offset-4 transition-colors hover:text-accent"
              >
                Continue to CitePark
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-6">
        <GoogleButton
          intent="signin"
          label="Sign in with Google"
          disabled={isSubmitting}
        />
        <AuthDivider />
      </div>

      <form onSubmit={onSubmit} noValidate className="mt-6 space-y-5">
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
          placeholder="Your password"
          autoComplete="current-password"
          disabled={isSubmitting}
          error={errors.password?.message}
          {...register("password", { required: "Please enter your password." })}
        />

        <div className="-mt-2 flex justify-end">
          <Link
            to="/forgot-password"
            className="text-xs font-medium text-muted-foreground underline decoration-border decoration-1 underline-offset-4 transition-colors hover:text-primary hover:decoration-accent"
          >
            Forgot your password?
          </Link>
        </div>

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
              Signing in…
            </>
          ) : (
            <>
              Sign in
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </form>
    </AuthShell>
  );
};

export default Login;
