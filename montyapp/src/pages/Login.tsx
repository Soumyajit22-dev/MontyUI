import { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { ArrowRight, Loader2 } from "lucide-react";
import { AuthShell } from "@/components/auth/AuthShell";
import { AuthField } from "@/components/auth/AuthField";
import { authErrorMessage, goToApp, signInWithPassword } from "@/lib/auth";

interface LoginValues {
  email: string;
  password: string;
}

const Login = () => {
  const [formError, setFormError] = useState<string | null>(null);

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
      <form onSubmit={onSubmit} noValidate className="space-y-5">
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
