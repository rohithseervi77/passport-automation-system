import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reset Account Password",
  description: "Set a new secure password for your Passport Automation System citizen or officer account.",
};

export default function ResetPasswordLayout({ children }: { children: React.ReactNode }) {
  return children;
}
