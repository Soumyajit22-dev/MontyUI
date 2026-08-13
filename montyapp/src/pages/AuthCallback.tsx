import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";

/**
 * The address Google's redirect is aimed at.
 *
 * Landing here with credentials never reaches this component — `GoogleReturnGate`
 * sits above the router and has already taken over. So this only renders when
 * someone arrives with nothing to redeem: a bookmark, a back button, or a
 * redirect that has been used already. There is nothing to finish, so it hands
 * them to the sign-in page rather than leaving them on a blank screen.
 */
const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    navigate("/login", { replace: true });
  }, [navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <Loader2 className="h-4 w-4 animate-spin text-accent" />
    </div>
  );
};

export default AuthCallback;
