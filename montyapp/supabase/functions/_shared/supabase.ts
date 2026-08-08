/**
 * Resolving the caller is what makes a payment belong to somebody: the order is
 * stamped with their id on the way out, and the upgrade is applied to that same
 * id on the way back.
 */
import { createClient, type SupabaseClient, type User } from "npm:@supabase/supabase-js@2";

/**
 * Service-role client — it bypasses RLS, so it is only ever reached for a user
 * whose own JWT has already been resolved. SUPABASE_URL and
 * SUPABASE_SERVICE_ROLE_KEY are injected into every Edge Function; they are not
 * secrets you set yourself.
 */
export function adminClient(): SupabaseClient {
  const url = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !serviceRoleKey) {
    throw new Error("SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY are not available to this function.");
  }
  return createClient(url, serviceRoleKey, { auth: { persistSession: false } });
}

/**
 * The signed-in caller, or null. An unauthenticated browser sends the anon key
 * here instead of an access token, which resolves to no user — the same answer
 * as a missing header.
 */
export async function userFromRequest(
  req: Request,
  admin: SupabaseClient
): Promise<User | null> {
  const header = req.headers.get("Authorization");
  if (!header?.startsWith("Bearer ")) return null;

  const { data, error } = await admin.auth.getUser(header.slice("Bearer ".length));
  if (error) return null;
  return data.user;
}
