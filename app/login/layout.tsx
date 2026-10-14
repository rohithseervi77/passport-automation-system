import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Citizen & Official Login",
  description: "Secure gateway for citizens, Passport Officers, and Police Enquiry Authorities to access the Passport Automation System.",
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
