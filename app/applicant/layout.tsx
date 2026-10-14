import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Citizen Applicant Portal",
  description: "Citizen dashboard to manage passport applications, upload verification documents, book PSK appointments, and pay fees.",
};

export default function ApplicantLayout({ children }: { children: React.ReactNode }) {
  return children;
}
