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
 * here can sign in over there with the same credentials. The session itself does
 * not travel: it lives in this origin's localStorage, and app.citepark.com asks
 * for its own login.
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
