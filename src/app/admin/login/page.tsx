import { Suspense } from "react";
import AdminLogin from "./login-client";

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <AdminLogin />
    </Suspense>
  );
}
