import { BrowserRouter, Link, Route, Routes } from "react-router-dom";
import { Amplify } from "aws-amplify";
import { Authenticator } from "@aws-amplify/ui-react";
import RouteGuard from "./components/RouteGuard";

import Login from "./components/Login";
import Home from "./components/Home";
import "./App.css";

const amplifyConfig = {
  Auth: {
    mandatorySignIn: false,
    region: import.meta.env.VITE_APP_REGION,
    userPoolId: import.meta.env.VITE_APP_USER_POOL_ID,
    userPoolWebClientId: import.meta.env.VITE_APP_USER_POOL_CLIENT_ID,
    identityPoolId: import.meta.env.VITE_APP_IDENTITY_POOL_ID,
  },
  API: {
    endpoints: [
      {
        name: "api",
        endpoint: import.meta.env.VITE_APP_API_URL,
        region: import.meta.env.VITE_APP_REGION,
      },
    ],
  },
  Storage: {
    AWSS3: {
      bucket: import.meta.env.VITE_APP_S3_BUCKET_NAME,
      region: import.meta.env.VITE_APP_REGION,
      level: "protected",
    },
  }
};
Amplify.configure(amplifyConfig);

function App() {
  return (
    <Authenticator.Provider>
      <BrowserRouter>
        <main className="min-h-screen bg-stone-800 font-mono">
          <Routes>
            <Route
              path="/"
              element={
                <RouteGuard>
                  <Home />
                </RouteGuard>
              }
            />
            <Route path="/login" element={<Login />} />
          </Routes>
        </main>
      </BrowserRouter>
    </Authenticator.Provider>
  );
}

export default App;
