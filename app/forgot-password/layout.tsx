import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Forgot Password",
  description: "Recover access to your Passport Automation System account with secure email verification.",
};

export default function ForgotPasswordLayout({ children }: { children: React.ReactNode }) {
  return children;
}
