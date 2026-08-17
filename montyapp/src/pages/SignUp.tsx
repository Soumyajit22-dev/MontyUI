import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { ArrowRight, Loader2, MailCheck, UserRound } from "lucide-react";
import { AuthShell } from "@/components/auth/AuthShell";
import { AuthField } from "@/components/auth/AuthField";
import { AuthDivider, GoogleButton } from "@/components/auth/GoogleButton";
import { ConsentCheckbox } from "@/components/auth/ConsentCheckbox";
import { AlreadySignedIn } from "@/components/auth/AlreadySignedIn";
import { useSession } from "@/hooks/use-session";
import { APP_URL } from "@/lib/supabase";
import {
  NEW_ACCOUNT_PARAM,
  authErrorMessage,
  goToApp,
  recordTermsConsent,
  signUpWithPassword,
} from "@/lib/auth";

interface SignUpValues {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  acceptedTerms: boolean;
}

const CONSENT_REQUIRED =
  "Please accept the Terms & Conditions and Privacy Policy to create an account.";

/**
 * The same demand, for the one place the account already exists — Google made
 * it on the way here, so "to create an account" would be describing something
 * that has already happened.
 */
const CONSENT_REQUIRED_TO_CONTINUE =
  "Please accept the Terms & Conditions and Privacy Policy to continue.";

const SignUp = () => {
  const [formError, setFormError] = useState<string | null>(null);
  const [sentTo, setSentTo] = useState<string | null>(null);

  // The `justCreated` banner's own tick — separate from the form's, because the
  // form is not the thing being confirmed there and may not even be reachable.
  const [bannerConsent, setBannerConsent] = useState(false);
  const [bannerError, setBannerError] = useState<string | null>(null);

  // Set when someone pressed "Sign in with Google" for an address that had no
  // account. Google made one on the way here, so the sign-up they came for has
  // already happened — this is the page that owes them that explanation.
  const [params] = useSearchParams();
  const justCreated = params.get(NEW_ACCOUNT_PARAM) === "1";

  const { status, user } = useSession();

  const {
    register,
    handleSubmit,
    getValues,
    trigger,
    setFocus,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<SignUpValues>({
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
      acceptedTerms: false,
    },
  });

  /**
   * Holds the Google button behind the same tick as the form.
   *
   * Both buttons on this page create an account, so consent has to gate both or
   * it gates nothing — a visitor who finds the checkbox inconvenient would
   * simply press the one above it. The form gets this for free from `required`;
   * Google needs the veto, since it leaves the page rather than submitting.
   *
   * `trigger` paints the error, `setFocus` puts the cursor in the box — which
   * also scrolls it into view, and matters here because the Google button is at
   * the top of the page and the checkbox is near the bottom, so an error alone
   * would appear somewhere the visitor is not looking.
   */
  const consentGivenOrExplained = (): boolean => {
    if (getValues("acceptedTerms")) return true;
    void trigger("acceptedTerms");
    setFocus("acceptedTerms");
    return false;
  };

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      const outcome = await signUpWithPassword(
        values.email.trim(),
        values.password,
        values.fullName.trim(),
        // Stamped when the account is created, not when the box was ticked:
        // the difference is seconds, and this is the one of the two that is
        // actually witnessed by the server.
        new Date().toISOString()
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

  // Nothing until the session is known — see the same guard on /login.
  if (status === "loading") return null;

  // An account in hand means there is nothing to sign up for. `justCreated` is
  // the exception: Google made the account on the way here, and this page owes
  // that visitor the explanation rather than a generic "you're signed in".
  if (status === "signed-in" && user && !justCreated) {
    return <AlreadySignedIn user={user} />;
  }

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
      {justCreated && (
        <div className="mb-6 rounded-2xl border border-border bg-paper p-5">
          <div className="flex items-start gap-3">
            <UserRound className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden />
            <div className="space-y-4">
              <p className="text-sm leading-relaxed text-primary">
                That Google account didn't have a CitePark account yet — so we've created
                one. Just one thing to agree to.
              </p>

              {/* The one route where an account exists before anyone was asked.
                  Google's endpoint signs in and signs up in the same call, so a
                  visitor who pressed "Sign in with Google" on /login without an
                  account got one made for them — and arrives here past every
                  tick on this page. This is the first chance to ask, so it is
                  asked here rather than written off. */}
              <ConsentCheckbox
                checked={bannerConsent}
                onChange={(e) => {
                  setBannerConsent(e.target.checked);
                  if (e.target.checked) setBannerError(null);
                }}
                error={bannerError ?? undefined}
              />

              <button
                type="button"
                onClick={async () => {
                  if (!bannerConsent) {
                    setBannerError(CONSENT_REQUIRED_TO_CONTINUE);
                    return;
                  }
                  await recordTermsConsent(new Date().toISOString());
                  goToApp();
                }}
                className="inline-flex items-center gap-2 text-sm font-semibold text-primary underline decoration-accent decoration-2 underline-offset-4 transition-colors hover:text-accent"
              >
                Continue to CitePark
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Google verifies the address itself, so this route skips the
          confirmation email the form below has to send. */}
      <div className="space-y-6">
        <GoogleButton
          intent="signup"
          label="Sign up with Google"
          disabled={isSubmitting}
          beforeStart={consentGivenOrExplained}
          stampConsent
        />
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

        {/* Above the button, not below it: the tick is a precondition of
            pressing it, and a condition printed underneath the action it
            governs is read after the decision it was meant to inform. */}
        <ConsentCheckbox
          disabled={isSubmitting}
          error={errors.acceptedTerms?.message}
          {...register("acceptedTerms", {
            required: CONSENT_REQUIRED,
            // Clears the moment they comply. Without this the complaint outlives
            // the thing it was complaining about: react-hook-form only starts
            // re-validating on change once the form has been *submitted*, and
            // the Google veto raises this error via `trigger` instead — so a
            // visitor who ticked the box would still be looking at red text
            // telling them to tick the box.
            onChange: () => clearErrors("acceptedTerms"),
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
