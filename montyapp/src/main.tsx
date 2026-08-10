import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { RESET_PATH } from "./lib/auth.ts";

/**
 * A recovery link is supposed to land on {@link RESET_PATH}, but Supabase falls
 * back to the project's Site URL whenever the link's `redirect_to` is not in the
 * Auth redirect allow list — dropping the visitor on `/` with the credentials
 * still in the fragment. Carry them the rest of the way rather than showing the
 * marketing page, so links already sitting in inboxes keep working.
 */
function rerouteStrayRecoveryLink(): void {
  if (window.location.pathname === RESET_PATH) return;

  const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
  const isRecovery =
    hash.get("type") === "recovery" ||
    (hash.has("access_token") && hash.has("refresh_token"));
  if (!isRecovery && !hash.has("error_code")) return;

  window.history.replaceState(null, "", RESET_PATH + window.location.hash);
}

rerouteStrayRecoveryLink();

createRoot(document.getElementById("root")!).render(<App />);
