import { createClient } from "@supabase/supabase-js";

function required(name: keyof ImportMetaEnv): string {
  const value = import.meta.env[name];
  if (!value) {
    throw new Error(
      `Missing ${name}. Copy montyapp/.env.example to montyapp/.env and fill it in.`
    );
  }
  return value;
}

const supabaseUrl = required("VITE_SUPABASE_URL");
const supabaseKey = required("VITE_SUPABASE_PUBLISHABLE_KEY");

/**
 * citepark.com and app.citepark.com share one Supabase project, so a user created
 * here can sign in over there with the same credentials.
 *
 * The session lives in this origin's localStorage, which app.citepark.com cannot
 * read. What crosses is a cookie on the domain both share — see ./sso.ts — so
 * the product app can pick the session up instead of asking for a second login.
 */
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
  },
});

/** The product app users are handed off to once they have an account. */
export const APP_URL = import.meta.env.VITE_APP_URL || "https://app.citepark.com";
