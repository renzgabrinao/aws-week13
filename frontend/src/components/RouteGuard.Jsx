import { Navigate } from "react-router-dom";
import { useAuthenticator } from "@aws-amplify/ui-react";

function RouteGuard({ children }) {
  const { route } = useAuthenticator((context) => [context.route]);

  if (route == "idle") {
    return <></>;
  }

  if (route !== "authenticated") {
    return <Navigate to="/login" />;
  }

  return children;
}

export default RouteGuard;
