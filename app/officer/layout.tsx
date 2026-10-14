import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Passport Officer Console",
  description: "Passport Officer workstation for reviewing citizen documents, biometric verification, police report review, and passport issuance.",
};

export default function OfficerLayout({ children }: { children: React.ReactNode }) {
  return children;
}
