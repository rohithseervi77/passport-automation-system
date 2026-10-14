import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Register for Passport Seva",
  description: "Create an official applicant account to submit fresh passport applications, upload documents, and book PSK appointments online.",
};

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return children;
}
