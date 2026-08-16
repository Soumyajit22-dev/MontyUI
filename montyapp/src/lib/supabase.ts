import { createClient } from "@supabase/supabase-js";

/**
 * The value is passed in rather than looked up by name on purpose. Vite
 * replaces `import.meta.env.VITE_FOO` at build time only when the property is
 * written out statically; a computed `import.meta.env[name]` cannot be matched,
 * so it falls back to emitting the whole env object into the bundle — every
 * VITE_-prefixed variable, whether or not the code ever reads it. Keeping each
 * access literal is what confines the bundle to the two values below.
 */
function required(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(
      `Missing ${name}. Copy montyapp/.env.example to montyapp/.env and fill it in.`
    );
  }
  return value;
}

const supabaseUrl = required("VITE_SUPABASE_URL", import.meta.env.VITE_SUPABASE_URL);
const supabaseKey = required(
  "VITE_SUPABASE_PUBLISHABLE_KEY",
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
);

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
